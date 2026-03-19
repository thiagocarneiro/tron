'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseRestTimerReturn {
  timeLeft: number
  isRunning: boolean
  progress: number // 0 to 1
  start: (durationSeconds: number) => void
  stop: () => void
  skip: () => void
}

export function useRestTimer(): UseRestTimerReturn {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [totalDuration, setTotalDuration] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setTimeLeft(0)
  }, [])

  const start = useCallback((durationSeconds: number) => {
    stop()
    setTotalDuration(durationSeconds)
    setTimeLeft(durationSeconds)
    setIsRunning(true)
  }, [stop])

  const skip = useCallback(() => {
    stop()
  }, [stop])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            setIsRunning(false)
            // Vibrate
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200])
            }
            // Play beep sound
            try {
              const audioCtx = new AudioContext()
              const oscillator = audioCtx.createOscillator()
              const gainNode = audioCtx.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(audioCtx.destination)
              oscillator.frequency.value = 800
              oscillator.type = 'sine'
              gainNode.gain.value = 0.3
              oscillator.start()
              setTimeout(() => { oscillator.stop(); audioCtx.close() }, 500)
            } catch {}
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0

  return { timeLeft, isRunning, progress, start, stop, skip }
}
