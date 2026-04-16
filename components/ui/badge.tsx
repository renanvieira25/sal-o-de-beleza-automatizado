import { cn } from '@/lib/utils'
import type { BookingStatus } from '@/types'

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  late_cancelled: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-[#fce4f3] text-[#e91e8c] border-[#e91e8c]/20',
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', className)}>
      {children}
    </span>
  )
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge className={statusStyles[status]}>
      {{ pending: 'Aguardando', confirmed: 'Confirmada', cancelled: 'Cancelada', late_cancelled: 'Cancel. tardio', completed: 'Concluída' }[status]}
    </Badge>
  )
}

export { Badge, StatusBadge }
