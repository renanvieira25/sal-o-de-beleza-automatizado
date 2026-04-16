import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    { data: spaces },
    { data: allBookings },
    { data: profiles },
    { data: pricing },
    { data: blocked },
  ] = await Promise.all([
    supabase.from('spaces').select('*').order('name'),
    supabase.from('bookings').select('*, space:spaces(*), profile:profiles(*)').order('start_datetime', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('pricing').select('*'),
    supabase.from('blocked_periods').select('*, space:spaces(name)').order('start_datetime', { ascending: false }),
  ])

  const todayBookings = (allBookings ?? []).filter(b =>
    new Date(b.start_datetime) >= todayStart && new Date(b.start_datetime) <= todayEnd
  )
  const monthRevenue = (allBookings ?? [])
    .filter(b => new Date(b.created_at) >= monthStart && !['cancelled', 'late_cancelled'].includes(b.status))
    .reduce((acc, b) => acc + (b.total_price ?? 0), 0)
  const pendingCount = (allBookings ?? []).filter(b => b.status === 'pending').length
  const occupancyToday = spaces?.length
    ? Math.round((todayBookings.filter(b => !['cancelled', 'late_cancelled'].includes(b.status)).length / (spaces.length * 3)) * 100)
    : 0

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#fdf8f8]">
        <AdminDashboard
          spaces={spaces ?? []}
          bookings={allBookings ?? []}
          profiles={profiles ?? []}
          pricing={pricing ?? []}
          blockedPeriods={blocked ?? []}
          stats={{ todayBookings: todayBookings.length, monthRevenue, pendingCount, occupancyToday }}
        />
      </main>
      <Footer />
    </div>
  )
}
