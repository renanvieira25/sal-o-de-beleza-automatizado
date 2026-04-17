import { parseISO } from 'date-fns'
import type { BookingSlot } from './useBookings'
import type { BlockedPeriod } from '@/types'

export type ChairStatus = 'free' | 'partial' | 'busy' | 'blocked'
export type HourStatus = 'free' | 'occupied' | 'blocked' | 'past'
export type DayStatus = 'free' | 'partial' | 'busy'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8)

export function useAvailability(bookings: BookingSlot[], blocked: BlockedPeriod[], date: Date) {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  function getHourStatus(spaceId: string, hour: number): HourStatus {
    const slotStart = new Date(date); slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(date); slotEnd.setHours(hour + 1, 0, 0, 0)

    if (isToday && slotEnd <= now) return 'past'

    const isBlocked = blocked.some(bl => {
      if (bl.space_id !== null && bl.space_id !== spaceId) return false
      return slotStart < parseISO(bl.end_datetime) && slotEnd > parseISO(bl.start_datetime)
    })
    if (isBlocked) return 'blocked'

    const isOccupied = bookings.some(b => {
      if (b.space_id !== spaceId) return false
      return slotStart < parseISO(b.end_datetime) && slotEnd > parseISO(b.start_datetime)
    })
    return isOccupied ? 'occupied' : 'free'
  }

  function getChairStatus(spaceId: string): ChairStatus {
    const statuses = HOURS.map(h => getHourStatus(spaceId, h))
    const nonPast = statuses.filter(s => s !== 'past')
    if (nonPast.length === 0) return 'busy'
    if (nonPast.every(s => s === 'blocked')) return 'blocked'
    if (nonPast.every(s => s === 'occupied' || s === 'blocked')) return 'busy'
    if (nonPast.some(s => s === 'occupied' || s === 'blocked')) return 'partial'
    return 'free'
  }

  function getOccupyingBooking(spaceId: string, hour: number): BookingSlot | null {
    const slotStart = new Date(date); slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(date); slotEnd.setHours(hour + 1, 0, 0, 0)
    return bookings.find(b => {
      if (b.space_id !== spaceId) return false
      return slotStart < parseISO(b.end_datetime) && slotEnd > parseISO(b.start_datetime)
    }) ?? null
  }

  function getNextFreeHour(spaceId: string): number | null {
    return HOURS.find(h => getHourStatus(spaceId, h) === 'free') ?? null
  }

  function getDayStatus(spaceId: string, d: Date, monthBk: BookingSlot[]): DayStatus {
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999)
    const dayBk = monthBk.filter(b =>
      b.space_id === spaceId &&
      parseISO(b.start_datetime) >= dayStart &&
      parseISO(b.start_datetime) <= dayEnd
    )
    let occupied = 0
    for (const h of HOURS) {
      const s = new Date(d); s.setHours(h, 0, 0, 0)
      const e = new Date(d); e.setHours(h + 1, 0, 0, 0)
      if (dayBk.some(b => s < parseISO(b.end_datetime) && e > parseISO(b.start_datetime))) occupied++
    }
    if (occupied === 0) return 'free'
    if (occupied >= 8) return 'busy'
    return 'partial'
  }

  return { getHourStatus, getChairStatus, getOccupyingBooking, getNextFreeHour, getDayStatus }
}
