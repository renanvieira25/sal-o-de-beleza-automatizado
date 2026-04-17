import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookingRoom } from '@/components/booking/BookingRoom'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default async function ReservarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: spaces }, { data: pricing }] = await Promise.all([
    supabase.from('spaces').select('*').eq('is_active', true).order('name'),
    supabase.from('pricing').select('*').eq('is_active', true),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#fdf8f8] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="font-playfair text-3xl font-semibold text-[#1a1a1a] mb-1">Reservar Cadeira</h1>
            <p className="text-sm text-[#7a6b6b]">
              Escolha a data no calendário, clique na cadeira e arraste os horários na timeline.
            </p>
          </div>
          <BookingRoom
            spaces={spaces ?? []}
            pricing={pricing ?? []}
            userId={user.id}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
