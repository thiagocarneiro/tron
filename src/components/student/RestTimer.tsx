'use client'

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
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center">
      <span className="font-[family-name:var(--font-label)] text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-6">
        Descanso Recomendado
      </span>

      {/* Circular progress */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96" cy="96" r={radius}
            fill="transparent"
            stroke="#262626"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="96" cy="96" r={radius}
            fill="transparent"
            stroke="#d7a0ff"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 ${10 + progress * 16}px rgba(215, 160, 255, ${0.2 + progress * 0.4}))`,
            }}
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[family-name:var(--font-headline)] font-black text-5xl tracking-tighter text-on-background tabular-nums">
            {String(minutes).padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold text-tertiary uppercase tracking-widest">
            Restante
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={onSkip}
          className="bg-surface-bright w-10 h-10 rounded flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface"
        >
          <span className="material-symbols-outlined text-lg">replay_10</span>
        </button>
        <button
          onClick={onSkip}
          className="bg-surface-bright w-10 h-10 rounded flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface"
        >
          <span className="material-symbols-outlined text-lg">forward_30</span>
        </button>
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="mt-8 font-[family-name:var(--font-label)] text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
      >
        Pular Descanso
      </button>
    </div>
  )
}
