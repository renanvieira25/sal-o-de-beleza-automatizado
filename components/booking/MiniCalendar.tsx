'use client'
import { useState, useEffect, useRef } from 'react'
import {
  addMonths, subMonths, format,
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAvailability } from '@/hooks/useAvailability'
import type { BookingSlot } from '@/hooks/useBookings'
import type { Space } from '@/types'

interface Props {
  selected: Date
  onSelect: (date: Date) => void
  spaces: Space[]
}

export function MiniCalendar({ selected, onSelect, spaces }: Props) {
  const [viewMonth, setViewMonth] = useState(() => new Date())
  const [monthBookings, setMonthBookings] = useState<BookingSlot[]>([])
  const supabase = useRef(createClient()).current
  const { getDayStatus } = useAvailability([], [], viewMonth)

  useEffect(() => {
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const end   = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0, 23, 59, 59)
    supabase.from('bookings')
      .select('id, space_id, start_datetime, end_datetime, status')
      .gte('start_datetime', start.toISOString())
      .lte('start_datetime', end.toISOString())
      .not('status', 'in', '("cancelled","late_cancelled")')
      .then(({ data }) => setMonthBookings((data as BookingSlot[]) ?? []))
  }, [`${viewMonth.getFullYear()}-${viewMonth.getMonth()}`])

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) })
  const padStart = getDay(startOfMonth(viewMonth))
  const cells: (Date | null)[] = [...Array(padStart).fill(null), ...days]

  function dayDot(d: Date): string {
    if (spaces.length === 0) return 'bg-green-400'
    const statuses = spaces.map(s => getDayStatus(s.id, d, monthBookings))
    const busy    = statuses.filter(s => s === 'busy').length
    const partial = statuses.filter(s => s === 'partial').length
    if (busy === spaces.length) return 'bg-red-400'
    if (busy > 0 || partial > 0) return 'bg-amber-400'
    return 'bg-green-400'
  }

  const isPast = (d: Date) => { const t = new Date(); t.setHours(0, 0, 0, 0); return d < t }

  return (
    <div className="space-y-3">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewMonth(m => subMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-[#fce4f3] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[#7a6b6b]" />
        </button>
        <span className="text-sm font-semibold text-[#1a1a1a] capitalize">
          {format(viewMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button
          onClick={() => setViewMonth(m => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-[#fce4f3] transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[#7a6b6b]" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {['D','S','T','Q','Q','S','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-[#7a6b6b] py-1 uppercase">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const past = isPast(d)
          const sun  = d.getDay() === 0
          const sel  = isSameDay(d, selected)
          const tod  = isToday(d)

          return (
            <button
              key={i}
              disabled={past || sun}
              onClick={() => onSelect(new Date(d))}
              className={`relative aspect-square flex items-center justify-center text-xs rounded-lg font-medium transition-all
                ${past || sun ? 'text-[#ccc] cursor-not-allowed' : 'cursor-pointer'}
                ${sel
                  ? 'bg-[#e91e8c] text-white'
                  : !past && !sun ? 'hover:bg-[#fce4f3] text-[#1a1a1a]' : ''}
              `}
            >
              {tod && !sel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e91e8c]" />
              )}
              {format(d, 'd')}
              {!past && !sun && !sel && (
                <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${dayDot(d)}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[10px] text-[#7a6b6b]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Alta disponibilidade</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Parcial</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"  />Lotado</span>
      </div>
    </div>
  )
}
