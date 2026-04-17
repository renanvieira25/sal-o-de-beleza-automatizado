'use client'
import { ChairCard } from './ChairCard'
import type { Space } from '@/types'
import type { ChairStatus } from '@/hooks/useAvailability'

interface Props {
  spaces: Space[]
  getChairStatus: (id: string) => ChairStatus
  getNextFreeHour: (id: string) => number | null
  selectedChairId: string | null
  onSelectChair: (id: string) => void
}

export function SalonMap({ spaces, getChairStatus, getNextFreeHour, selectedChairId, onSelectChair }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#e91e8c]" />
        Planta do Salão — clique na cadeira para selecionar
      </h3>

      <div
        className="relative rounded-2xl border-2 border-dashed border-[#e5d5d5] bg-[#fdf8f8] overflow-hidden"
        style={{ minHeight: 220 }}
      >
        {/* Room label */}
        <div className="absolute top-2 left-3 text-[10px] text-[#7a6b6b] uppercase tracking-widest font-medium select-none">
          Salão Principal
        </div>

        {/* Top wall: mirrors */}
        <div className="absolute top-7 left-0 right-0 flex justify-center gap-4 px-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5"
              style={{ width: spaces.length > 0 ? `${Math.floor(90 / spaces.length)}%` : '28%', maxWidth: 80 }}
            >
              <div className="w-full h-8 rounded-sm border-2 border-[#ddd] bg-white/70 flex items-center justify-center shadow-sm">
                <div className="w-3/4 h-4 rounded-sm bg-gradient-to-b from-white/80 to-[#f0e8e8]/60" />
              </div>
              <span className="text-[9px] text-[#bbb] select-none">espelho</span>
            </div>
          ))}
        </div>

        {/* Chairs */}
        <div className="flex items-end justify-around px-4 pt-24 pb-14">
          {spaces.map(space => (
            <ChairCard
              key={space.id}
              space={space}
              status={getChairStatus(space.id)}
              selected={selectedChairId === space.id}
              nextFreeHour={getNextFreeHour(space.id)}
              onClick={() => onSelectChair(space.id)}
            />
          ))}
        </div>

        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center select-none">
          <div className="w-16 h-3 rounded-t-sm border-t-2 border-x-2 border-[#ccc] bg-[#e5d5d5]" />
          <span className="text-[9px] text-[#7a6b6b] mb-1">entrada</span>
        </div>

        {/* Bathroom */}
        <div className="absolute bottom-3 right-3 flex flex-col items-center gap-0.5 select-none">
          <div className="w-10 h-10 rounded border border-dashed border-[#ccc] bg-white/60 flex items-center justify-center text-base">
            🚿
          </div>
          <span className="text-[9px] text-[#7a6b6b]">WC</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-0.5 select-none">
          {[
            { color: '#22c55e', label: 'Livre'     },
            { color: '#f59e0b', label: 'Parcial'   },
            { color: '#ef4444', label: 'Ocupada'   },
            { color: '#6b7280', label: 'Bloqueada' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
              <span className="text-[10px] text-[#7a6b6b]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
