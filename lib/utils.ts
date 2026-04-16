import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string | Date, fmt = "dd/MM/yyyy 'às' HH:mm") {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: ptBR })
}

export function formatDateShort(date: string | Date) {
  return formatDate(date, 'dd/MM/yyyy')
}

export function isSunday(date: Date) {
  return date.getDay() === 0
}

export function isWithinBusinessHours(date: Date) {
  const h = date.getHours()
  return h >= 8 && h < 20
}
