'use client'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[#e91e8c] text-white hover:bg-[#c9187a] focus:ring-[#e91e8c]/40',
        outline: 'border-2 border-[#e91e8c] text-[#e91e8c] bg-transparent hover:bg-[#fce4f3] focus:ring-[#e91e8c]/30',
        ghost: 'text-[#e91e8c] hover:bg-[#fce4f3] focus:ring-[#e91e8c]/30',
        secondary: 'bg-[#f5f0f0] text-[#5a3a4a] hover:bg-[#ede4e4]',
        destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
        link: 'text-[#e91e8c] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-5 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
