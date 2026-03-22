'use client'

import { useRouter } from 'next/navigation'

interface WorkoutCardProps {
  id: string
  name: string
  icon: string
  exerciseCount: number
  muscleGroups: string[]
  phaseColor?: string
  orderIndex: number
  isFirst?: boolean
}

const WORKOUT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export function WorkoutCard({ id, name, exerciseCount, muscleGroups, orderIndex, isFirst }: WorkoutCardProps) {
  const router = useRouter()
  const letter = WORKOUT_LETTERS[orderIndex] || String.fromCharCode(65 + orderIndex)

  return (
    <div
      className={`group relative overflow-hidden rounded-xl hover:translate-y-[-4px] transition-all duration-300 border border-outline-variant/5 ${
        isFirst ? 'bg-surface-container-high' : 'bg-surface-container-low hover:bg-surface-container-high'
      }`}
    >
      {/* Floating icon */}
      <div className="absolute top-0 right-0 p-4">
        <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">fitness_center</span>
      </div>

      {/* HOJE badge on first card */}
      {isFirst && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-primary px-3 py-1 text-black font-[family-name:var(--font-headline)] font-black text-xs uppercase tracking-widest">
            HOJE
          </span>
        </div>
      )}

      <div className="p-6 lg:p-8">
        {/* Label: letter + type */}
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 block ${isFirst ? 'mt-6 lg:mt-0' : ''}`}>
          {letter} - {name.replace(/\d+/g, '').trim().toUpperCase() || 'WORKOUT'}
        </span>

        {/* Workout name */}
        <h3 className="text-2xl lg:text-3xl font-[family-name:var(--font-headline)] font-bold uppercase tracking-tight mb-4 lg:mb-6 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="space-y-4 mb-6 lg:mb-8">
          {/* Exercise count */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">Exercícios</span>
            <span className="text-lg font-[family-name:var(--font-headline)] font-bold tabular-nums">
              {String(exerciseCount).padStart(2, '0')}
            </span>
          </div>

          {/* Muscle group tags */}
          <div className="flex flex-wrap gap-2">
            {muscleGroups.slice(0, 5).map(group => (
              <span
                key={group}
                className="px-3 py-1 bg-surface-container-highest rounded text-[10px] font-bold uppercase tracking-tighter"
              >
                {group}
              </span>
            ))}
            {muscleGroups.length > 5 && (
              <span className="px-3 py-1 bg-surface-container-highest rounded text-[10px] font-bold uppercase tracking-tighter">
                +{muscleGroups.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/aluno/treinos/${id}`)
          }}
          className={`w-full py-4 font-[family-name:var(--font-headline)] font-black text-sm tracking-widest transition-all ${
            isFirst
              ? 'border border-primary/30 text-primary hover:bg-primary hover:text-black'
              : 'border border-outline-variant/20 text-on-surface-variant hover:border-primary/30 hover:text-primary'
          }`}
        >
          INICIAR TREINO
        </button>
      </div>
    </div>
  )
}
