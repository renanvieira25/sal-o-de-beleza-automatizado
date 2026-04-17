'use client'
import { useState } from 'react'
import { useBookings } from '@/hooks/useBookings'
import { useAvailability } from '@/hooks/useAvailability'
import { MiniCalendar } from './MiniCalendar'
import { SalonMap } from './SalonMap'
import { TimelineGrid } from './TimelineGrid'
import { BookingPanel } from './BookingPanel'
import type { Space, Pricing } from '@/types'

interface Props {
  spaces: Space[]
  pricing: Pricing[]
  userId: string
}

export function BookingRoom({ spaces, userId }: Props) {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d
  })
  const [selectedChairId, setSelectedChairId] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null)

  const { bookings, blocked, monthBookings, loading } = useBookings(date)
  const { getHourStatus, getChairStatus, getOccupyingBooking, getNextFreeHour } = useAvailability(bookings, blocked, date)

  const selectedSpace = spaces.find(s => s.id === selectedChairId) ?? null

  function handleDateChange(d: Date) {
    setDate(d)
    setSelectedRange(null)
    setSelectedChairId(null)
  }

  function handleSelectChair(id: string) {
    setSelectedChairId(id)
    setSelectedRange(null)
  }

  function handleSelectRange(chairId: string, start: number, end: number) {
    setSelectedChairId(chairId)
    setSelectedRange({ start, end })
  }

  function handleClear() {
    setSelectedRange(null)
  }

  function handleConfirmed() {
    setSelectedRange(null)
    setSelectedChairId(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr_260px] gap-5">
      {/* ── Left: Calendar ── */}
      <div className="bg-white rounded-2xl border border-[#ede4e4] p-4 h-fit">
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e91e8c]" />
          Escolha a Data
        </h2>
        <MiniCalendar
          selected={date}
          onSelect={handleDateChange}
          monthBookings={monthBookings}
          spaces={spaces}
        />
      </div>

      {/* ── Center: Map + Timeline ── */}
      <div className="bg-white rounded-2xl border border-[#ede4e4] p-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-9 h-9 rounded-full border-4 border-[#e91e8c] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <SalonMap
              spaces={spaces}
              getChairStatus={getChairStatus}
              getNextFreeHour={getNextFreeHour}
              selectedChairId={selectedChairId}
              onSelectChair={handleSelectChair}
            />
            <TimelineGrid
              spaces={spaces}
              selectedChairId={selectedChairId}
              selectedRange={selectedRange}
              getHourStatus={getHourStatus}
              getOccupyingBooking={getOccupyingBooking}
              onSelectRange={handleSelectRange}
              onClear={handleClear}
            />
          </>
        )}
      </div>

      {/* ── Right: Booking panel ── */}
      <div className="lg:sticky lg:top-6 h-fit">
        <BookingPanel
          space={selectedSpace}
          date={date}
          range={selectedRange}
          userId={userId}
          onConfirmed={handleConfirmed}
          onClear={handleClear}
        />
      </div>
    </div>
  )
}
