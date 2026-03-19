'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'

interface WorkoutCardProps {
  id: string
  name: string
  icon: string
  exerciseCount: number
  muscleGroups: string[]
}

export function WorkoutCard({ id, name, icon, exerciseCount, muscleGroups }: WorkoutCardProps) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/aluno/treinos/${id}`)}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 hover:bg-[#252525] hover:border-[#333] transition-all duration-200 cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <h3 className="font-semibold font-[family-name:var(--font-heading)]">{name}</h3>
          <p className="text-sm text-[#a0a0a0]">{exerciseCount} exercícios</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {muscleGroups.slice(0, 5).map(group => (
          <Badge key={group} size="sm">{group}</Badge>
        ))}
        {muscleGroups.length > 5 && (
          <Badge size="sm">+{muscleGroups.length - 5}</Badge>
        )}
      </div>
    </div>
  )
}
