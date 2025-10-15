'use client'

import { useRouter } from 'next/navigation'
import MobileCalendar from '@/components/MobileCalendar'

export default function CalendarPage() {
  const router = useRouter()

  const handleEventClick = (event: any) => {
    // Handle event click - could open event details modal
    console.log('Event clicked:', event)
  }

  const handleAddEvent = () => {
    router.push('/dashboard/events/new')
  }

  return (
    <MobileCalendar 
      onEventClick={handleEventClick}
      onAddEvent={handleAddEvent}
    />
  )
}