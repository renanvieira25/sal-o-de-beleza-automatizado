'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Scissors, Calendar, Clock, DollarSign, X, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Space } from '@/types'

interface Props {
  space: Space | null
  date: Date
  range: { start: number; end: number } | null
  userId: string
  onConfirmed: () => void
  onClear: () => void
}

function calcBooking(hours: number): { price: number; type: string; bookingType: string } {
  if (hours >= 12) return { price: 120, type: 'Diária (08h–20h)', bookingType: 'daily' }
  return { price: 25 * hours, type: `${hours}× R$25/h`, bookingType: 'hourly' }
}

export function BookingPanel({ space, date, range, userId, onConfirmed, onClear }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')

  const hours = range ? range.end - range.start : 0
  const { price, type, bookingType } = calcBooking(hours)
  const hasSelection = !!(space && range && hours > 0)

  async function handleConfirm() {
    if (!hasSelection) return
    setLoading(true)
    setError('')

    const start = new Date(date); start.setHours(range!.start, 0, 0, 0)
    const end   = new Date(date); end.setHours(range!.end, 0, 0, 0)

    const { data, error: err } = await supabase.from('bookings').insert({
      space_id:       space!.id,
      user_id:        userId,
      start_datetime: start.toISOString(),
      end_datetime:   end.toISOString(),
      booking_type:   bookingType,
      status:         'pending',
      total_price:    price,
      notes:          notes || null,
    }).select('id').single()

    if (err) {
      setError('Horário indisponível ou já ocupado. Tente outro período.')
      setLoading(false)
      return
    }

    setSuccess(data.id.slice(0, 8).toUpperCase())
    setNotes('')
    setLoading(false)
    onConfirmed()
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#fce4f3] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-[#e91e8c]" />
          </div>
          <div>
            <h3 className="font-playfair text-xl font-semibold text-[#1a1a1a]">Reserva solicitada!</h3>
            <p className="text-xs text-[#7a6b6b] mt-1">Código da reserva</p>
            <p className="font-mono text-2xl font-bold text-[#e91e8c] mt-1">#{success}</p>
          </div>
          <p className="text-xs text-[#7a6b6b] leading-relaxed">
            Pagamento via Pix — nossa equipe entrará em contato para confirmar e enviar a chave.
          </p>
          <Button className="w-full" variant="outline" size="sm" onClick={() => setSuccess(null)}>
            Fazer nova reserva
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-5 space-y-4">
        <h3 className="font-playfair text-lg font-semibold text-[#1a1a1a]">Sua Reserva</h3>

        {!hasSelection ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#fce4f3]/60 flex items-center justify-center mx-auto">
              <Scissors className="w-5 h-5 text-[#e91e8c]/40" />
            </div>
            <p className="text-sm text-[#7a6b6b] leading-relaxed">
              Selecione uma cadeira no mapa e arraste os blocos na timeline para escolher o horário.
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <Scissors className="w-4 h-4 text-[#e91e8c] flex-shrink-0" />
                <span className="font-medium text-[#1a1a1a]">{space!.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#e91e8c] flex-shrink-0" />
                <span className="text-[#1a1a1a]">
                  {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#e91e8c] flex-shrink-0" />
                <span className="text-[#1a1a1a]">
                  {String(range!.start).padStart(2,'0')}:00 → {String(range!.end).padStart(2,'0')}:00
                  <span className="text-[#7a6b6b] ml-1.5">({hours}h)</span>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-[#ede4e4] pt-3 space-y-1">
              <p className="text-xs text-[#7a6b6b]">{type}</p>
              <div className="flex items-baseline gap-1.5">
                <DollarSign className="w-5 h-5 text-[#e91e8c] flex-shrink-0" />
                <span className="font-playfair text-3xl font-bold text-[#e91e8c]">
                  {formatCurrency(price)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1.5">
                Observações <span className="text-[#7a6b6b] font-normal">(opcional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ex: preciso de iluminação extra..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-xl border border-[#ede4e4] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/30 focus:border-[#e91e8c] transition-all"
              />
            </div>

            {/* Payment notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
              💳 Pagamento via Pix após confirmação da equipe
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={handleConfirm} disabled={loading} className="w-full">
                {loading ? 'Confirmando...' : 'Confirmar Reserva'}
              </Button>
              <Button variant="outline" size="sm" onClick={onClear} className="w-full gap-1.5">
                <X className="w-3.5 h-3.5" /> Limpar seleção
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
