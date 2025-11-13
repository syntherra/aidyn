import { useEffect, useState } from 'react'
import { listenUserActivities } from '../firebase'

export const useUserActivities = (userId?: string) => {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    if (!userId) return
    const unsub = listenUserActivities(userId, setItems)
    return () => unsub()
  }, [userId])
  return items
}

