'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'

interface PRCelebrationProps {
  exerciseName: string
  weight: number
  reps: number
  onClose: () => void
}

export function PRCelebration({ exerciseName, weight, reps, onClose }: PRCelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    // Vibrate
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent backdrop-blur-xl rounded-md p-8 text-center animate-[bounceIn_0.5s_ease-out]">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)]">
            <Trophy size={32} className="text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-amber-400 mb-1">
          Novo PR!
        </h3>
        <p className="text-white font-medium">{exerciseName}</p>
        <p className="text-5xl font-black font-[family-name:var(--font-heading)] text-white mt-3 tabular-nums">
          {weight}kg × {reps}
        </p>
        <p className="text-white/35 text-xs uppercase tracking-widest mt-1">reps</p>
      </div>
    </div>
  )
}
