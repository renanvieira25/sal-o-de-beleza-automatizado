import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, DollarSign, Scissors, PlusCircle, History, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Booking } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const now = new Date().toISOString()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('*, space:spaces(*)')
    .eq('user_id', user.id)
    .gte('start_datetime', now)
    .in('status', ['pending', 'confirmed'])
    .order('start_datetime', { ascending: true })
    .limit(5)

  const { data: pastBookings } = await supabase
    .from('bookings')
    .select('*, space:spaces(*)')
    .eq('user_id', user.id)
    .lt('end_datetime', now)
    .order('start_datetime', { ascending: false })
    .limit(5)

  const { data: monthBookings } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)
    .not('status', 'in', '("cancelled","late_cancelled")')

  const monthTotal = (monthBookings ?? []).reduce((acc, b) => acc + (b.total_price ?? 0), 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#fdf8f8]">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-playfair text-3xl font-semibold text-[#1a1a1a]">
                Olá, {profile?.full_name?.split(' ')[0]} 👋
              </h1>
              <p className="text-sm text-[#7a6b6b] mt-1">{profile?.specialty ?? 'Profissional autônoma'}</p>
            </div>
            <Link href="/reservar">
              <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Nova Reserva</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-5 pb-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#fce4f3] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-[#e91e8c]" />
                </div>
                <div>
                  <p className="text-xs text-[#7a6b6b]">Próximas reservas</p>
                  <p className="text-2xl font-semibold text-[#1a1a1a]">{upcomingBookings?.length ?? 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#fce4f3] flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-[#e91e8c]" />
                </div>
                <div>
                  <p className="text-xs text-[#7a6b6b]">Gasto este mês</p>
                  <p className="text-2xl font-semibold text-[#1a1a1a]">{formatCurrency(monthTotal)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#fce4f3] flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-5 h-5 text-[#e91e8c]" />
                </div>
                <div>
                  <p className="text-xs text-[#7a6b6b]">Histórico total</p>
                  <p className="text-2xl font-semibold text-[#1a1a1a]">{(pastBookings?.length ?? 0) + (upcomingBookings?.length ?? 0)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Próximas reservas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#e91e8c]" />
                  Próximas Reservas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!upcomingBookings?.length ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#7a6b6b] mb-4">Nenhuma reserva futura</p>
                    <Link href="/reservar"><Button size="sm" variant="outline">Fazer primeira reserva</Button></Link>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {upcomingBookings.map((b: Booking & { space?: { name: string } }) => (
                      <li key={b.id} className="flex items-start justify-between border-b border-[#ede4e4] pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a]">{(b.space as { name: string })?.name}</p>
                          <p className="text-xs text-[#7a6b6b] mt-0.5">{formatDate(b.start_datetime)}</p>
                          <p className="text-xs text-[#e91e8c] font-medium mt-0.5">{formatCurrency(b.total_price)}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Histórico */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-4 h-4 text-[#e91e8c]" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!pastBookings?.length ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#7a6b6b]">Nenhuma reserva passada</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {pastBookings.map((b: Booking & { space?: { name: string } }) => (
                      <li key={b.id} className="flex items-start justify-between border-b border-[#ede4e4] pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a]">{(b.space as { name: string })?.name}</p>
                          <p className="text-xs text-[#7a6b6b] mt-0.5">{formatDate(b.start_datetime)}</p>
                          <p className="text-xs text-[#e91e8c] font-medium mt-0.5">{formatCurrency(b.total_price)}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick action */}
          <div className="mt-6">
            <Link href="/reservar">
              <div className="bg-gradient-to-r from-[#e91e8c] to-[#c9187a] rounded-2xl p-6 flex items-center justify-between text-white cursor-pointer hover:opacity-95 transition-opacity">
                <div>
                  <p className="font-playfair text-xl font-semibold">Reserve seu espaço agora</p>
                  <p className="text-white/80 text-sm mt-1">Veja a disponibilidade em tempo real</p>
                </div>
                <ChevronRight className="w-6 h-6 flex-shrink-0" />
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
