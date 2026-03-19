'use client'

import { useEffect, useState, useCallback } from 'react'
import { getPendingSets, removePendingSet } from '@/utils/offline-db'
import { apiClient } from '@/api/client'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const syncPendingSets = useCallback(async () => {
    if (isSyncing) return
    setIsSyncing(true)

    try {
      const pending = await getPendingSets()
      setPendingCount(pending.length)

      for (const set of pending) {
        try {
          await apiClient.post(`/api/student/sessions/${set.sessionId}/sets`, {
            exerciseId: set.exerciseId,
            setType: set.setType,
            weight: set.weight,
            reps: set.reps,
            completed: set.completed,
          })
          await removePendingSet(set.id)
          setPendingCount((c) => c - 1)
        } catch {
          break // Stop syncing on first failure
        }
      }
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncPendingSets()
    }
  }, [isOnline, syncPendingSets])

  return { isOnline, isSyncing, pendingCount, syncPendingSets }
}
