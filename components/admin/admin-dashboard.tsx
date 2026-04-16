'use client'
import { useState } from 'react'
import { BarChart3, Calendar, Users, DollarSign, Clock, Ban, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Space, Booking, Profile, Pricing, BlockedPeriod, BookingStatus } from '@/types'

type BookingWithRelations = Booking & { space?: Space; profile?: Profile }
type BlockedWithSpace = BlockedPeriod & { space?: { name: string } | null }

interface Props {
  spaces: Space[]
  bookings: BookingWithRelations[]
  profiles: Profile[]
  pricing: Pricing[]
  blockedPeriods: BlockedWithSpace[]
  stats: { todayBookings: number; monthRevenue: number; pendingCount: number; occupancyToday: number }
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'bookings', label: 'Reservas', icon: Calendar },
  { id: 'blocked', label: 'Bloqueios', icon: Ban },
  { id: 'pricing', label: 'Preços', icon: DollarSign },
  { id: 'users', label: 'Profissionais', icon: Users },
]

export function AdminDashboard({ spaces, bookings, profiles, pricing, blockedPeriods, stats }: Props) {
  const supabase = createClient()
  const [tab, setTab] = useState('overview')
  const [pricingEdit, setPricingEdit] = useState<Record<string, string>>({})
  const [savingPrice, setSavingPrice] = useState<string | null>(null)
  const [blockForm, setBlockForm] = useState({ space_id: '', start: '', end: '', reason: '' })
  const [savingBlock, setSavingBlock] = useState(false)
  const [localBookings, setLocalBookings] = useState(bookings)
  const [localBlocked, setLocalBlocked] = useState(blockedPeriods)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  async function updateBookingStatus(id: string, status: BookingStatus) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setLocalBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  async function savePrice(p: Pricing) {
    setSavingPrice(p.id)
    const val = parseFloat(pricingEdit[p.id] ?? String(p.price_per_unit))
    if (!isNaN(val)) {
      await supabase.from('pricing').update({ price_per_unit: val, updated_at: new Date().toISOString() }).eq('id', p.id)
    }
    setSavingPrice(null)
    setPricingEdit(prev => { const n = { ...prev }; delete n[p.id]; return n })
  }

  async function addBlock() {
    setSavingBlock(true)
    const { data } = await supabase.from('blocked_periods').insert({
      space_id: blockForm.space_id || null,
      start_datetime: new Date(blockForm.start).toISOString(),
      end_datetime: new Date(blockForm.end).toISOString(),
      reason: blockForm.reason || null,
    }).select('*, space:spaces(name)').single()
    if (data) setLocalBlocked(prev => [data, ...prev])
    setBlockForm({ space_id: '', start: '', end: '', reason: '' })
    setSavingBlock(false)
  }

  async function removeBlock(id: string) {
    await supabase.from('blocked_periods').delete().eq('id', id)
    setLocalBlocked(prev => prev.filter(b => b.id !== id))
  }

  const filteredBookings = statusFilter === 'all' ? localBookings : localBookings.filter(b => b.status === statusFilter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl font-semibold text-[#1a1a1a]">Painel Administrativo</h1>
        <p className="text-sm text-[#7a6b6b] mt-1">Espaço Ela — Gestão completa do salão</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f5f0f0] rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${tab === t.id ? 'bg-white text-[#e91e8c] shadow-sm' : 'text-[#7a6b6b] hover:text-[#1a1a1a]'}`}
          >
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Reservas hoje', value: stats.todayBookings, icon: Calendar, color: 'text-blue-500' },
              { label: 'Receita do mês', value: formatCurrency(stats.monthRevenue), icon: DollarSign, color: 'text-green-500' },
              { label: 'Pendentes', value: stats.pendingCount, icon: Clock, color: 'text-amber-500' },
              { label: 'Ocupação hoje', value: `${stats.occupancyToday}%`, icon: BarChart3, color: 'text-[#e91e8c]' },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fce4f3] flex items-center justify-center flex-shrink-0">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-[#7a6b6b]">{stat.label}</p>
                    <p className="text-xl font-bold text-[#1a1a1a]">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Últimas reservas</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {localBookings.slice(0, 8).map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-[#ede4e4] last:border-0 text-sm">
                    <div>
                      <span className="font-medium text-[#1a1a1a]">{b.profile?.full_name}</span>
                      <span className="text-[#7a6b6b] mx-2">·</span>
                      <span className="text-[#7a6b6b]">{b.space?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#e91e8c] font-medium">{formatCurrency(b.total_price)}</span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BOOKINGS */}
      {tab === 'bookings' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${statusFilter === s ? 'bg-[#e91e8c] text-white border-[#e91e8c]' : 'border-[#ede4e4] text-[#7a6b6b] hover:border-[#e91e8c]/40'}`}
              >
                {{ all: 'Todas', pending: 'Pendentes', confirmed: 'Confirmadas', completed: 'Concluídas', cancelled: 'Canceladas' }[s]}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredBookings.map(b => (
              <Card key={b.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1a1a1a] text-sm">{b.profile?.full_name}</p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-[#7a6b6b]">{b.space?.name} · {formatDate(b.start_datetime)}</p>
                      <p className="text-xs text-[#e91e8c] font-medium">{formatCurrency(b.total_price)}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {b.status === 'pending' && (
                        <Button size="sm" onClick={() => updateBookingStatus(b.id, 'confirmed')}>Confirmar</Button>
                      )}
                      {['pending', 'confirmed'].includes(b.status) && (
                        <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'completed')}>Concluir</Button>
                      )}
                      {!['cancelled', 'late_cancelled', 'completed'].includes(b.status) && (
                        <Button size="sm" variant="destructive" onClick={() => updateBookingStatus(b.id, 'cancelled')}>Cancelar</Button>
                      )}
                    </div>
                  </div>
                  {b.notes && <p className="text-xs text-[#7a6b6b] mt-2 italic">"{b.notes}"</p>}
                </CardContent>
              </Card>
            ))}
            {filteredBookings.length === 0 && <p className="text-center text-sm text-[#7a6b6b] py-8">Nenhuma reserva encontrada.</p>}
          </div>
        </div>
      )}

      {/* BLOCKED PERIODS */}
      {tab === 'blocked' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Ban className="w-4 h-4 text-[#e91e8c]" /> Novo Bloqueio</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#1a1a1a] block mb-1">Cadeira (deixe vazio = todas)</label>
                <select
                  className="w-full rounded-xl border border-[#ede4e4] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/30 focus:border-[#e91e8c]"
                  value={blockForm.space_id}
                  onChange={e => setBlockForm(f => ({ ...f, space_id: e.target.value }))}
                >
                  <option value="">Todas as cadeiras</option>
                  {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#1a1a1a] block mb-1">Data e hora de início</label>
                <Input type="datetime-local" value={blockForm.start} onChange={e => setBlockForm(f => ({ ...f, start: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1a1a1a] block mb-1">Data e hora de fim</label>
                <Input type="datetime-local" value={blockForm.end} onChange={e => setBlockForm(f => ({ ...f, end: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1a1a1a] block mb-1">Motivo (opcional)</label>
                <Input placeholder="Ex: Manutenção" value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={addBlock} disabled={savingBlock || !blockForm.start || !blockForm.end}>
                {savingBlock ? 'Salvando...' : 'Adicionar Bloqueio'}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-[#1a1a1a]">Bloqueios ativos</h3>
            {localBlocked.length === 0 && <p className="text-sm text-[#7a6b6b]">Nenhum bloqueio ativo.</p>}
            {localBlocked.map(bl => (
              <Card key={bl.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a]">{bl.space ? (bl.space as { name: string }).name : 'Todas as cadeiras'}</p>
                      <p className="text-xs text-[#7a6b6b] mt-0.5">{formatDate(bl.start_datetime)} → {formatDate(bl.end_datetime)}</p>
                      {bl.reason && <p className="text-xs text-[#5a3a4a] mt-0.5 italic">{bl.reason}</p>}
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeBlock(bl.id)}>Remover</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* PRICING */}
      {tab === 'pricing' && (
        <div className="max-w-md">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4 text-[#e91e8c]" /> Tabela de Preços</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {pricing.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-[#7a6b6b] block mb-1 capitalize">{p.unit_label}</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#1a1a1a]">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={pricingEdit[p.id] ?? p.price_per_unit}
                        onChange={e => setPricingEdit(prev => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-28"
                      />
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => savePrice(p)} disabled={savingPrice === p.id || !pricingEdit[p.id]}>
                    {savingPrice === p.id ? '...' : 'Salvar'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="space-y-3">
          {profiles.filter(p => p.role === 'autonoma').map(p => (
            <Card key={p.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1a1a1a] text-sm">{p.full_name}</p>
                  <p className="text-xs text-[#7a6b6b]">{p.specialty} · {p.phone ?? 'Sem telefone'}</p>
                  <p className="text-xs text-[#7a6b6b]">Cadastrada em {formatDate(p.created_at, 'dd/MM/yyyy')}</p>
                </div>
                <span className="text-xs bg-[#fce4f3] text-[#e91e8c] px-2.5 py-1 rounded-full font-medium">
                  {localBookings.filter(b => b.user_id === p.id).length} reservas
                </span>
              </CardContent>
            </Card>
          ))}
          {profiles.filter(p => p.role === 'autonoma').length === 0 && (
            <p className="text-center text-sm text-[#7a6b6b] py-8">Nenhuma profissional cadastrada.</p>
          )}
        </div>
      )}
    </div>
  )
}
