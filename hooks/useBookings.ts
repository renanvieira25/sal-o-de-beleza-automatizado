'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BlockedPeriod } from '@/types'

export interface BookingSlot {
  id: string
  space_id: string
  user_id: string
  start_datetime: string
  end_datetime: string
  booking_type: string
  status: string
  total_price: number
  notes: string | null
}

export function useBookings(date: Date) {
  const supabase = useRef(createClient()).current
  const dateRef = useRef(date)
  dateRef.current = date

  const [bookings, setBookings] = useState<BookingSlot[]>([])
  const [blocked, setBlocked] = useState<BlockedPeriod[]>([])
  const [monthBookings, setMonthBookings] = useState<BookingSlot[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDay = useCallback(async (d: Date) => {
    const start = new Date(d); start.setHours(0, 0, 0, 0)
    const end = new Date(d); end.setHours(23, 59, 59, 999)
    const [{ data: bk }, { data: bl }] = await Promise.all([
      supabase.from('bookings').select('*')
        .gte('start_datetime', start.toISOString())
        .lte('start_datetime', end.toISOString())
        .not('status', 'in', '("cancelled","late_cancelled")'),
      supabase.from('blocked_periods').select('*')
        .lte('start_datetime', end.toISOString())
        .gte('end_datetime', start.toISOString()),
    ])
    setBookings(bk ?? [])
    setBlocked(bl ?? [])
    setLoading(false)
  }, [])

  const fetchMonth = useCallback(async (d: Date) => {
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const { data } = await supabase.from('bookings')
      .select('id, space_id, start_datetime, end_datetime, status')
      .gte('start_datetime', start.toISOString())
      .lte('start_datetime', end.toISOString())
      .not('status', 'in', '("cancelled","late_cancelled")')
    setMonthBookings((data as BookingSlot[]) ?? [])
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchDay(date)
  }, [date.toDateString()])

  useEffect(() => {
    fetchMonth(date)
  }, [`${date.getFullYear()}-${date.getMonth()}`])

  useEffect(() => {
    const ch = supabase.channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDay(dateRef.current)
        fetchMonth(dateRef.current)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  return { bookings, blocked, monthBookings, loading, refetch: () => fetchDay(date) }
}
