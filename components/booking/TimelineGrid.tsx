'use client'
import { useState, useRef, useEffect } from 'react'
import type { Space } from '@/types'
import type { HourStatus } from '@/hooks/useAvailability'
import type { BookingSlot } from '@/hooks/useBookings'
import { formatCurrency } from '@/lib/utils'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8)

interface Props {
  spaces: Space[]
  selectedChairId: string | null
  selectedRange: { start: number; end: number } | null
  getHourStatus: (spaceId: string, hour: number) => HourStatus
  getOccupyingBooking: (spaceId: string, hour: number) => BookingSlot | null
  onSelectRange: (chairId: string, start: number, end: number) => void
  onClear: () => void
}

interface DragState { chairId: string; start: number; end: number }

export function TimelineGrid({
  spaces, selectedChairId, selectedRange,
  getHourStatus, getOccupyingBooking, onSelectRange, onClear,
}: Props) {
  const [dragVisual, setDragVisual] = useState<DragState | null>(null)
  const [tooltip, setTooltip] = useState<{ chairId: string; hour: number } | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const onSelectRef = useRef(onSelectRange)
  onSelectRef.current = onSelectRange

  useEffect(() => {
    function handleMouseUp() {
      if (dragRef.current) {
        const { chairId, start, end } = dragRef.current
        onSelectRef.current(chairId, Math.min(start, end), Math.max(start, end) + 1)
      }
      dragRef.current = null
      setDragVisual(null)
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  function handleMouseDown(chairId: string, hour: number, status: HourStatus) {
    if (status !== 'free') return
    const state = { chairId, start: hour, end: hour }
    dragRef.current = state
    setDragVisual(state)
  }

  function handleMouseEnter(chairId: string, hour: number) {
    if (!dragRef.current || dragRef.current.chairId !== chairId) return
    if (getHourStatus(chairId, hour) === 'past') return
    const updated = { ...dragRef.current, end: hour }
    dragRef.current = updated
    setDragVisual({ chairId, start: Math.min(updated.start, updated.end), end: Math.max(updated.start, updated.end) })
  }

  function isInDrag(chairId: string, hour: number) {
    return dragVisual?.chairId === chairId && hour >= dragVisual.start && hour <= dragVisual.end
  }

  function isInSelection(chairId: string, hour: number) {
    return selectedChairId === chairId && selectedRange != null && hour >= selectedRange.start && hour < selectedRange.end
  }

  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#e91e8c]" />
        Timeline — arraste para selecionar múltiplas horas
        {selectedRange && (
          <button onClick={onClear} className="ml-auto text-xs text-[#7a6b6b] hover:text-[#e91e8c] transition-colors underline underline-offset-2">
            Limpar seleção
          </button>
        )}
      </h3>

      <div className="overflow-x-auto rounded-xl border border-[#ede4e4] bg-white select-none">
        <div style={{ minWidth: 580 }}>
          {/* Hour headers */}
          <div className="flex border-b border-[#ede4e4]">
            <div className="w-28 flex-shrink-0 border-r border-[#ede4e4] bg-[#fdf8f8]" />
            {HOURS.map(h => (
              <div key={h} className="flex-1 py-2 text-center text-[11px] text-[#7a6b6b] font-medium border-r border-[#ede4e4] last:border-r-0">
                {String(h).padStart(2, '0')}h
              </div>
            ))}
          </div>

          {/* Chair rows */}
          {spaces.map((space, idx) => (
            <div key={space.id} className={`flex ${idx < spaces.length - 1 ? 'border-b border-[#ede4e4]' : ''}`}>
              {/* Row label */}
              <div
                className={`w-28 flex-shrink-0 px-3 py-2 flex items-center border-r border-[#ede4e4] text-xs font-medium transition-colors ${
                  selectedChairId === space.id
                    ? 'bg-[#fce4f3] text-[#e91e8c]'
                    : 'bg-[#fdf8f8] text-[#5a3a4a]'
                }`}
              >
                <span className="truncate leading-tight">{space.name.split(' — ')[0]}</span>
              </div>

              {/* Hour cells */}
              {HOURS.map(h => {
                const status = getHourStatus(space.id, h)
                const booking = getOccupyingBooking(space.id, h)
                const inSel = isInSelection(space.id, h)
                const inDrag = isInDrag(space.id, h)
                const showTip = tooltip?.chairId === space.id && tooltip?.hour === h

                let bg = 'white'
                if (inSel || inDrag) bg = 'linear-gradient(135deg, #e91e8c 0%, #c9187a 100%)'
                else if (status === 'occupied') bg = '#fce4f3'
                else if (status === 'blocked') bg = 'repeating-linear-gradient(45deg,#e5e5e5,#e5e5e5 3px,#f5f5f5 3px,#f5f5f5 9px)'
                else if (status === 'past') bg = '#f3f3f3'

                return (
                  <div
                    key={h}
                    className={`relative flex-1 h-11 border-r border-[#ede4e4] last:border-r-0 transition-colors duration-100 group ${
                      status === 'free' && !inSel ? 'hover:bg-green-50 cursor-pointer' : ''
                    } ${status !== 'free' && !inSel ? 'cursor-default' : ''}`}
                    style={{ background: bg }}
                    onMouseDown={() => handleMouseDown(space.id, h, status)}
                    onMouseEnter={() => { handleMouseEnter(space.id, h); setTooltip({ chairId: space.id, hour: h }) }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {/* Free: dashed border on hover */}
                    {status === 'free' && !inSel && !inDrag && (
                      <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-green-300 transition-colors duration-100 pointer-events-none" />
                    )}

                    {/* Occupied label */}
                    {status === 'occupied' && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-0.5">
                        <span className="text-[10px] font-medium text-[#e91e8c] truncate">Reservado</span>
                      </div>
                    )}

                    {/* Selected checkmark */}
                    {(inSel || inDrag) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}

                    {/* Tooltip */}
                    {showTip && (
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap z-30 pointer-events-none shadow-lg">
                        {String(h).padStart(2,'0')}:00–{String(h+1).padStart(2,'0')}:00
                        {status === 'free' && <span className="text-green-300"> · {formatCurrency(25)}</span>}
                        {status === 'occupied' && booking && <span className="text-red-300"> · Ocupado</span>}
                        {status === 'blocked' && <span className="text-gray-300"> · Bloqueado</span>}
                        {status === 'past' && <span className="text-gray-400"> · Passado</span>}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] rotate-45" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-[#7a6b6b]">
        {[
          { style: { background: 'white', border: '2px dashed #86efac' }, label: 'Livre' },
          { style: { background: '#fce4f3' },                             label: 'Ocupado' },
          { style: { background: 'linear-gradient(135deg,#e91e8c,#c9187a)' }, label: 'Selecionado' },
          { style: { background: 'repeating-linear-gradient(45deg,#e5e5e5,#e5e5e5 3px,#f5f5f5 3px,#f5f5f5 9px)' }, label: 'Bloqueado' },
          { style: { background: '#f3f3f3' }, label: 'Passado' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-5 h-4 rounded-sm border border-[#ede4e4] flex-shrink-0" style={l.style as React.CSSProperties} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
