export type PriceTier = 'offpeak' | 'standard' | 'peak'

export const TIER_CONFIG: Record<PriceTier, { label: string; price: number; color: string; bg: string }> = {
  offpeak:  { label: 'Off-peak', price: 15, color: '#3b82f6', bg: '#eff6ff' },
  standard: { label: 'Padrão',   price: 20, color: '#f59e0b', bg: '#fffbeb' },
  peak:     { label: 'Pico',     price: 29, color: '#ef4444', bg: '#fef2f2' },
}

// Regras:
//   Off-peak  → Seg, Ter, Qua (dia todo)
//   Pico      → Sex 15h–20h | Sáb 08h–14h
//   Padrão    → Qui (dia todo) | Sex 08h–15h | Sáb 14h–20h
export function getPriceTier(date: Date, hour: number): PriceTier {
  const day = date.getDay() // 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb
  if (day >= 1 && day <= 3) return 'offpeak'
  if (day === 5 && hour >= 15) return 'peak'
  if (day === 6 && hour < 14) return 'peak'
  return 'standard'
}

export function getPriceForHour(date: Date, hour: number): number {
  return TIER_CONFIG[getPriceTier(date, hour)].price
}

export interface BookingCalc {
  subtotal: number
  discountPct: number
  discountAmt: number
  total: number
  label: string
  bookingType: string
  breakdown: { tier: PriceTier; hours: number; subtotal: number }[]
}

export function calcBookingPrice(date: Date, startHour: number, endHour: number): BookingCalc {
  const totalHours = endHour - startHour
  const tierHours: Record<PriceTier, number> = { offpeak: 0, standard: 0, peak: 0 }

  let subtotal = 0
  for (let h = startHour; h < endHour; h++) {
    const tier = getPriceTier(date, h)
    tierHours[tier]++
    subtotal += TIER_CONFIG[tier].price
  }

  const breakdown = (Object.keys(tierHours) as PriceTier[])
    .filter(t => tierHours[t] > 0)
    .map(t => ({ tier: t, hours: tierHours[t], subtotal: tierHours[t] * TIER_CONFIG[t].price }))

  // 8+ horas → desconto diária de 15%
  const discountPct = totalHours >= 8 ? 15 : 0
  const discountAmt = Math.round(subtotal * discountPct) / 100
  const total       = subtotal - discountAmt
  const label       = totalHours >= 8 ? 'Diária (15% desc.)' : `${totalHours}h · tarifa dinâmica`
  const bookingType = totalHours >= 8 ? 'daily' : 'hourly'

  return { subtotal, discountPct, discountAmt, total, label, bookingType, breakdown }
}
