import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-xl border border-[#ede4e4] bg-white px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#7a6b6b]',
      'focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/30 focus:border-[#e91e8c]',
      'disabled:opacity-50 disabled:cursor-not-allowed transition-all',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
