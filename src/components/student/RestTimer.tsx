'use client'

import { cn } from '@/utils/formatters'

interface RestTimerProps {
  timeLeft: number
  progress: number
  isRunning: boolean
  onSkip: () => void
}

export function RestTimer({ timeLeft, progress, isRunning, onSkip }: RestTimerProps) {
  if (!isRunning) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <p className="text-[#a0a0a0] text-sm mb-4 uppercase tracking-wider">Descanso</p>

      {/* Circular progress */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="#FF3B30"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold font-[family-name:var(--font-heading)] tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="mt-8 px-6 py-2.5 border border-[#2a2a2a] rounded-xl text-[#a0a0a0] hover:bg-[#1a1a1a] transition-colors"
      >
        Pular Descanso
      </button>
    </div>
  )
}
