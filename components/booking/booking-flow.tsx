'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addHours, addDays, addWeeks, addMonths, format, isSameDay, parseISO, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, isSunday } from '@/lib/utils'
import type { Space, Pricing, BookingType } from '@/types'

interface Props {
  spaces: Space[]
  pricing: Pricing[]
  existingBookings: { space_id: string; start_datetime: string; end_datetime: string; status: string }[]
  blockedPeriods: { space_id: string | null; start_datetime: string; end_datetime: string }[]
  userId: string
}

const STEPS = ['Modalidade', 'Data & Horário', 'Cadeira', 'Confirmação']

const BOOKING_TYPE_INFO: Record<BookingType, { label: string; desc: string; durationHours?: number; durationDays?: number; durationWeeks?: number; durationMonths?: number }> = {
  hourly: { label: 'Por hora', desc: 'Mínimo 1 hora · Funciona das 08h às 20h', durationHours: 1 },
  daily: { label: 'Diária', desc: 'Dia completo 08h às 20h', durationDays: 1 },
  weekly: { label: 'Semanal', desc: '7 dias corridos', durationWeeks: 1 },
  monthly: { label: 'Mensal', desc: '30 dias corridos', durationMonths: 1 },
}

function getEndDate(start: Date, type: BookingType, hours = 1): Date {
  if (type === 'hourly') return addHours(start, hours)
  if (type === 'daily') return addDays(start, 1)
  if (type === 'weekly') return addWeeks(start, 1)
  return addMonths(start, 1)
}

function isSpaceAvailable(
  spaceId: string,
  start: Date,
  end: Date,
  bookings: Props['existingBookings'],
  blocked: Props['blockedPeriods'],
): boolean {
  const hasBookingConflict = bookings.some(b => {
    if (b.space_id !== spaceId) return false
    const bStart = parseISO(b.start_datetime)
    const bEnd = parseISO(b.end_datetime)
    return start < bEnd && end > bStart
  })

  const hasBlockConflict = blocked.some(bl => {
    if (bl.space_id !== null && bl.space_id !== spaceId) return false
    const bStart = parseISO(bl.start_datetime)
    const bEnd = parseISO(bl.end_datetime)
    return start < bEnd && end > bStart
  })

  return !hasBookingConflict && !hasBlockConflict
}

export function BookingFlow({ spaces, pricing, existingBookings, blockedPeriods, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [bookingType, setBookingType] = useState<BookingType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [startHour, setStartHour] = useState<number>(8)
  const [durationHours, setDurationHours] = useState<number>(1)
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState<string | null>(null)
  const [error, setError] = useState('')

  const selectedPricing = pricing.find(p => p.booking_type === bookingType)

  function getStart(): Date | null {
    if (!selectedDate || !bookingType) return null
    if (bookingType === 'hourly') {
      const d = new Date(selectedDate)
      d.setHours(startHour, 0, 0, 0)
      return d
    }
    const d = new Date(selectedDate)
    d.setHours(8, 0, 0, 0)
    return d
  }

  function getEnd(): Date | null {
    const start = getStart()
    if (!start || !bookingType) return null
    return getEndDate(start, bookingType, durationHours)
  }

  function getTotalPrice(): number {
    if (!selectedPricing) return 0
    if (bookingType === 'hourly') return selectedPricing.price_per_unit * durationHours
    return selectedPricing.price_per_unit
  }

  // Generate calendar days (next 30 days)
  const calendarDays: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 30; i++) {
    const d = addDays(today, i)
    if (!isSunday(d)) calendarDays.push(d)
  }

  function getSpaceAvailabilityForDay(spaceId: string, day: Date): 'free' | 'partial' | 'busy' {
    const start = new Date(day); start.setHours(8, 0, 0, 0)
    const end = new Date(day); end.setHours(20, 0, 0, 0)
    const available = isSpaceAvailable(spaceId, start, end, existingBookings, blockedPeriods)
    if (available) return 'free'
    // check partial
    let freeSlots = 0
    for (let h = 8; h < 20; h++) {
      const s = new Date(day); s.setHours(h, 0, 0, 0)
      const e = new Date(day); e.setHours(h + 1, 0, 0, 0)
      if (isSpaceAvailable(spaceId, s, e, existingBookings, blockedPeriods)) freeSlots++
    }
    return freeSlots > 0 ? 'partial' : 'busy'
  }

  async function handleSubmit() {
    const start = getStart()
    const end = getEnd()
    if (!start || !end || !selectedSpace || !bookingType) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.from('bookings').insert({
      space_id: selectedSpace.id,
      user_id: userId,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      booking_type: bookingType,
      status: 'pending',
      total_price: getTotalPrice(),
      notes: notes || null,
    }).select('id').single()

    if (err) {
      setError('Não foi possível realizar a reserva. O horário pode ter sido ocupado.')
      setLoading(false)
      return
    }
    setConfirmed(data.id)
    setStep(4)
    setLoading(false)
  }

  if (confirmed) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#fce4f3] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#e91e8c]" />
          </div>
          <h2 className="font-playfair text-2xl font-semibold text-[#1a1a1a] mb-2">Reserva solicitada!</h2>
          <p className="text-sm text-[#7a6b6b] mb-2">Código: <span className="font-mono font-semibold text-[#1a1a1a]">{confirmed.slice(0, 8).toUpperCase()}</span></p>
          <p className="text-sm text-[#7a6b6b] max-w-xs mx-auto mb-2">
            Pagamento via Pix — nossa equipe entrará em contato para confirmar e enviar a chave.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" onClick={() => { setStep(0); setConfirmed(null); setSelectedDate(null); setSelectedSpace(null); setBookingType(null) }}>Nova reserva</Button>
            <Button onClick={() => router.push('/dashboard')}>Ver painel</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className={`flex items-center gap-1.5 text-sm font-medium ${i === step ? 'text-[#e91e8c]' : i < step ? 'text-[#e91e8c]/60' : 'text-[#7a6b6b]'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? 'bg-[#e91e8c] text-white' : i < step ? 'bg-[#fce4f3] text-[#e91e8c]' : 'bg-[#ede4e4] text-[#7a6b6b]'}`}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-[#ede4e4] mx-2 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="py-6">
          {/* STEP 0: Modalidade */}
          {step === 0 && (
            <div>
              <h2 className="font-playfair text-xl font-semibold text-[#1a1a1a] mb-4">Escolha a modalidade</h2>
              <div className="grid grid-cols-2 gap-3">
                {pricing.map(p => (
                  <button
                    key={p.booking_type}
                    onClick={() => { setBookingType(p.booking_type); setStep(1) }}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${bookingType === p.booking_type ? 'border-[#e91e8c] bg-[#fce4f3]' : 'border-[#ede4e4] hover:border-[#e91e8c]/40'}`}
                  >
                    <p className="font-semibold text-[#1a1a1a]">{BOOKING_TYPE_INFO[p.booking_type].label}</p>
                    <p className="text-[#e91e8c] font-bold text-lg mt-1">{formatCurrency(p.price_per_unit)}<span className="text-xs text-[#7a6b6b] font-normal"> {p.unit_label}</span></p>
                    <p className="text-xs text-[#7a6b6b] mt-1">{BOOKING_TYPE_INFO[p.booking_type].desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Data & Horário */}
          {step === 1 && (
            <div>
              <h2 className="font-playfair text-xl font-semibold text-[#1a1a1a] mb-4">Escolha a data</h2>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mb-5">
                {calendarDays.slice(0, 21).map(day => {
                  const anyAvail = spaces.some(s => getSpaceAvailabilityForDay(s.id, day) !== 'busy')
                  const sel = selectedDate && isSameDay(day, selectedDate)
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`rounded-xl p-1.5 text-center border-2 transition-all ${sel ? 'border-[#e91e8c] bg-[#e91e8c] text-white' : anyAvail ? 'border-[#ede4e4] hover:border-[#e91e8c]/40' : 'border-[#ede4e4] opacity-40 cursor-not-allowed'}`}
                      disabled={!anyAvail}
                    >
                      <p className="text-[10px] uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
                      <p className="font-semibold text-sm">{format(day, 'd')}</p>
                    </button>
                  )
                })}
              </div>
              {bookingType === 'hourly' && selectedDate && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Horário de início</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(h => (
                      <button
                        key={h}
                        onClick={() => setStartHour(h)}
                        className={`rounded-xl border-2 py-1.5 text-sm font-medium transition-all ${startHour === h ? 'border-[#e91e8c] bg-[#fce4f3] text-[#e91e8c]' : 'border-[#ede4e4] hover:border-[#e91e8c]/40'}`}
                      >
                        {String(h).padStart(2, '0')}:00
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Duração</label>
                    <select
                      className="w-full rounded-xl border border-[#ede4e4] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/30 focus:border-[#e91e8c]"
                      value={durationHours}
                      onChange={e => setDurationHours(Number(e.target.value))}
                    >
                      {Array.from({ length: Math.min(12, 20 - startHour) }, (_, i) => i + 1).map(h => (
                        <option key={h} value={h}>{h}h — {formatCurrency(selectedPricing?.price_per_unit ?? 0 * h)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setStep(0)}>Voltar</Button>
                <Button onClick={() => setStep(2)} disabled={!selectedDate}>Próximo</Button>
              </div>
            </div>
          )}

          {/* STEP 2: Cadeira */}
          {step === 2 && (
            <div>
              <h2 className="font-playfair text-xl font-semibold text-[#1a1a1a] mb-1">Escolha a cadeira</h2>
              {selectedDate && (
                <p className="text-sm text-[#7a6b6b] mb-4">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
              )}
              <div className="flex gap-3 text-xs mb-4">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-400" />Disponível</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Parcial</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Ocupada</span>
              </div>
              <div className="space-y-3">
                {spaces.map(space => {
                  const avail = selectedDate ? getSpaceAvailabilityForDay(space.id, selectedDate) : 'free'
                  const start = getStart()
                  const end = getEnd()
                  const specificAvail = start && end ? isSpaceAvailable(space.id, start, end, existingBookings, blockedPeriods) : avail !== 'busy'
                  const sel = selectedSpace?.id === space.id

                  return (
                    <button
                      key={space.id}
                      onClick={() => specificAvail && setSelectedSpace(space)}
                      disabled={!specificAvail}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${sel ? 'border-[#e91e8c] bg-[#fce4f3]' : specificAvail ? 'border-[#ede4e4] hover:border-[#e91e8c]/40' : 'border-[#ede4e4] opacity-40 cursor-not-allowed'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-[#1a1a1a]">{space.name}</p>
                          <p className="text-xs text-[#7a6b6b] mt-0.5">{space.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {space.amenities?.slice(0, 3).map(a => (
                              <span key={a} className="bg-[#f5f0f0] text-[#5a3a4a] text-[10px] px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                          </div>
                        </div>
                        <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${avail === 'free' ? 'bg-green-400' : avail === 'partial' ? 'bg-amber-400' : 'bg-red-400'}`} />
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedSpace}>Próximo</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmação */}
          {step === 3 && (
            <div>
              <h2 className="font-playfair text-xl font-semibold text-[#1a1a1a] mb-4">Confirmar reserva</h2>
              <div className="bg-[#fdf8f8] rounded-xl border border-[#ede4e4] p-4 space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-[#7a6b6b]">Cadeira</span><span className="font-medium">{selectedSpace?.name}</span></div>
                <div className="flex justify-between"><span className="text-[#7a6b6b]">Modalidade</span><span className="font-medium">{bookingType && BOOKING_TYPE_INFO[bookingType].label}</span></div>
                {getStart() && <div className="flex justify-between"><span className="text-[#7a6b6b]">Início</span><span className="font-medium">{format(getStart()!, "dd/MM/yyyy 'às' HH:mm")}</span></div>}
                {getEnd() && <div className="flex justify-between"><span className="text-[#7a6b6b]">Fim</span><span className="font-medium">{format(getEnd()!, "dd/MM/yyyy 'às' HH:mm")}</span></div>}
                <div className="flex justify-between border-t border-[#ede4e4] pt-2 mt-2">
                  <span className="font-semibold text-[#1a1a1a]">Total</span>
                  <span className="font-bold text-[#e91e8c] text-lg">{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Observações (opcional)</label>
                <textarea
                  className="w-full rounded-xl border border-[#ede4e4] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/30 focus:border-[#e91e8c] resize-none"
                  rows={3}
                  placeholder="Ex: preciso de iluminação extra..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mb-4">
                💳 Pagamento via Pix — nossa equipe entrará em contato para confirmar e enviar a chave.
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Reservando...' : 'Confirmar Reserva'}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
