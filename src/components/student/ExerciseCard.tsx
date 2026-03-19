'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Play } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/formatters'

interface ExerciseCardProps {
  name: string
  equipmentOptions: string | null
  muscleGroups: string[]
  videoUrl: string | null
  hasWarmup: boolean
  warmupConfig: { sets: number; reps: string; note: string } | null
  feeder1Config: { reps: string; rest: string } | null
  feeder2Config: { reps: string; rest: string } | null
  workingSetConfig: {
    type: string
    sets?: number
    reps?: string
    rest?: string
    blocks?: number | string
    repsPerBlock?: string
    intraRest?: string
    duration?: string
  }
  backoffConfig: { reps: string; rest: string } | null
  orderIndex: number
}

export function ExerciseCard(props: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false)

  const renderWorkingSet = () => {
    const config = props.workingSetConfig
    if (config.type === 'straight') {
      return `${config.sets} séries × ${config.reps || config.duration} reps — Descanso: ${config.rest}`
    }
    if (config.type === 'cluster') {
      return `Cluster-Set: ${config.blocks} blocos × ${config.repsPerBlock} reps — Intra-rest: ${config.intraRest}`
    }
    if (config.type === 'isometric') {
      return `${config.sets} séries × ${config.duration} (isométrico) — Descanso: ${config.rest}`
    }
    return ''
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#252525] text-sm font-bold text-[#a0a0a0]">
          {props.orderIndex + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{props.name}</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {props.muscleGroups.map(g => (
              <span key={g} className="text-xs text-[#666]">{g}</span>
            ))}
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-[#555]" /> : <ChevronDown size={18} className="text-[#555]" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#2a2a2a] pt-3">
          {props.equipmentOptions && (
            <p className="text-xs text-[#666]">🏋️ Equipamento: {props.equipmentOptions}</p>
          )}

          {props.videoUrl && (
            <a
              href={props.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/10 text-red-400 rounded-lg text-sm hover:bg-red-600/20 transition-colors"
            >
              <Play size={14} /> Ver Vídeo
            </a>
          )}

          <div className="space-y-2">
            {/* Warmup */}
            {props.hasWarmup && props.warmupConfig && (
              <div className="flex items-start gap-2">
                <Badge color="#FF9500" size="sm">Aquecimento</Badge>
                <span className="text-sm text-[#a0a0a0]">
                  {props.warmupConfig.sets}×{props.warmupConfig.reps} reps — {props.warmupConfig.note}
                </span>
              </div>
            )}

            {/* Feeder 1 */}
            {props.feeder1Config && (
              <div className="flex items-start gap-2">
                <Badge color="#FF9500" size="sm">Feeder 1</Badge>
                <span className="text-sm text-[#a0a0a0]">
                  {props.feeder1Config.reps} reps — Descanso: {props.feeder1Config.rest}
                </span>
              </div>
            )}

            {/* Feeder 2 */}
            {props.feeder2Config && (
              <div className="flex items-start gap-2">
                <Badge color="#FF9500" size="sm">Feeder 2</Badge>
                <span className="text-sm text-[#a0a0a0]">
                  {props.feeder2Config.reps} reps — Descanso: {props.feeder2Config.rest}
                </span>
              </div>
            )}

            {/* Working Set */}
            <div className="flex items-start gap-2">
              <Badge color="#FF3B30" size="sm">Working Set</Badge>
              <span className="text-sm text-[#a0a0a0]">{renderWorkingSet()}</span>
            </div>

            {/* Back-off */}
            {props.backoffConfig && (
              <div className="flex items-start gap-2">
                <Badge color="#AF52DE" size="sm">Back-off</Badge>
                <span className="text-sm text-[#a0a0a0]">
                  {props.backoffConfig.reps} reps — Descanso: {props.backoffConfig.rest}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
