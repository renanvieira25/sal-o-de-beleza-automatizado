import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookingFlow } from '@/components/booking/booking-flow'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default async function ReservarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: spaces }, { data: pricing }, { data: bookings }, { data: blocked }] = await Promise.all([
    supabase.from('spaces').select('*').eq('is_active', true).order('name'),
    supabase.from('pricing').select('*').eq('is_active', true),
    supabase.from('bookings').select('space_id, start_datetime, end_datetime, status').gte('end_datetime', new Date().toISOString()).not('status', 'in', '("cancelled","late_cancelled")'),
    supabase.from('blocked_periods').select('*').gte('end_datetime', new Date().toISOString()),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#fdf8f8] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="font-playfair text-3xl font-semibold text-[#1a1a1a] mb-2">Nova Reserva</h1>
            <p className="text-[#7a6b6b] text-sm">Escolha a modalidade, o horário e a cadeira desejada.</p>
          </div>
          <BookingFlow
            spaces={spaces ?? []}
            pricing={pricing ?? []}
            existingBookings={bookings ?? []}
            blockedPeriods={blocked ?? []}
            userId={user.id}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
