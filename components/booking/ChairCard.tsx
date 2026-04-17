'use client'
import { useState } from 'react'
import type { Space } from '@/types'
import type { ChairStatus } from '@/hooks/useAvailability'

interface Props {
  space: Space
  status: ChairStatus
  selected: boolean
  nextFreeHour: number | null
  onClick: () => void
}

const STATUS_CONFIG: Record<ChairStatus, { color: string; bg: string; label: string; pulse: boolean }> = {
  free:    { color: '#22c55e', bg: '#dcfce7', label: 'Livre',     pulse: true  },
  partial: { color: '#f59e0b', bg: '#fef3c7', label: 'Parcial',   pulse: false },
  busy:    { color: '#ef4444', bg: '#fee2e2', label: 'Ocupada',   pulse: false },
  blocked: { color: '#6b7280', bg: '#f3f4f6', label: 'Bloqueada', pulse: false },
}

export function ChairCard({ space, status, selected, nextFreeHour, onClick }: Props) {
  const [hovered, setHovered] = useState(false)
  const cfg = STATUS_CONFIG[status]
  const clickable = status === 'free' || status === 'partial'

  return (
    <div
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300"
      style={{
        cursor: clickable ? 'pointer' : 'default',
        transform: hovered && clickable ? 'scale(1.06)' : 'scale(1)',
        outline: selected ? '3px solid #e91e8c' : '3px solid transparent',
        outlineOffset: '3px',
        boxShadow: selected ? '0 0 0 6px rgba(233,30,140,0.15)' : undefined,
        animation: selected ? 'chairPulse 2s ease-in-out infinite' : undefined,
      }}
    >
      {/* Chair SVG */}
      <div style={{ opacity: status === 'busy' || status === 'blocked' ? 0.45 : 1 }} className="w-16 h-20">
        <ChairSVG color={selected ? '#e91e8c' : cfg.color} />
      </div>

      {/* Status badge */}
      <div
        className={`absolute top-1 right-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.pulse ? 'animate-pulse' : ''}`}
        style={{ background: cfg.bg, color: cfg.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
        {cfg.label}
      </div>

      {/* Lock overlay */}
      {(status === 'busy' || status === 'blocked') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: 20 }}>
          <span className="text-xl drop-shadow">{status === 'blocked' ? '🚫' : '🔒'}</span>
        </div>
      )}

      {/* Chair name */}
      <p className="text-[11px] font-semibold text-[#1a1a1a] text-center leading-tight">
        {space.name.split(' — ')[0]}
        {space.name.includes(' — ') && (
          <span className="block font-normal text-[#7a6b6b]">{space.name.split(' — ')[1]}</span>
        )}
      </p>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap z-20 pointer-events-none shadow-lg">
          {status === 'busy'    ? 'Sem horários disponíveis' :
           status === 'blocked' ? 'Bloqueada pelo admin' :
           nextFreeHour !== null ? `Próximo livre: ${String(nextFreeHour).padStart(2,'0')}:00` :
           'Livre agora!'}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] rotate-45" />
        </div>
      )}
    </div>
  )
}

function ChairSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 90" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Backrest */}
      <rect x="14" y="4" width="52" height="26" rx="9" fill={color} />
      <rect x="23" y="8" width="34" height="14" rx="6" fill="white" fillOpacity="0.22" />
      {/* Seat */}
      <rect x="9" y="28" width="62" height="40" rx="11" fill={color} />
      <rect x="15" y="33" width="50" height="30" rx="9" fill="white" fillOpacity="0.13" />
      {/* Armrests */}
      <rect x="0"  y="33" width="11" height="27" rx="5" fill={color} />
      <rect x="69" y="33" width="11" height="27" rx="5" fill={color} />
      {/* Pedestal */}
      <rect x="31" y="68" width="18" height="9" rx="3" fill={color} fillOpacity="0.55" />
      {/* Base */}
      <ellipse cx="40" cy="83" rx="17" ry="5" fill={color} fillOpacity="0.32" />
    </svg>
  )
}
