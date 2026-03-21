'use client'

import { useState } from 'react'

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
  const [expanded, setExpanded] = useState(props.orderIndex === 0)

  const renderWorkingSetLabel = () => {
    const config = props.workingSetConfig
    if (config.type === 'cluster') return 'Cluster Set'
    if (config.type === 'isometric') return 'Isometric'
    return 'Working Set'
  }

  const renderWorkingSetReps = () => {
    const config = props.workingSetConfig
    if (config.type === 'straight') {
      return (
        <p className="font-[family-name:var(--font-headline)] text-lg font-bold">
          {config.sets} <span className="text-sm font-normal text-on-surface-variant">x</span> {config.reps || config.duration}
        </p>
      )
    }
    if (config.type === 'cluster') {
      return (
        <p className="font-[family-name:var(--font-headline)] text-lg font-bold">
          {config.blocks} <span className="text-sm font-normal text-on-surface-variant">x</span> {config.repsPerBlock}
        </p>
      )
    }
    if (config.type === 'isometric') {
      return (
        <p className="font-[family-name:var(--font-headline)] text-lg font-bold">
          {config.sets} <span className="text-sm font-normal text-on-surface-variant">x</span> {config.duration}
        </p>
      )
    }
    return null
  }

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start justify-between border-b border-outline-variant/10 text-left"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-primary font-[family-name:var(--font-headline)] font-black text-lg italic">
              {String(props.orderIndex + 1).padStart(2, '0')}
            </span>
            <h3 className="font-[family-name:var(--font-headline)] font-bold text-lg uppercase tracking-wide">
              {props.name}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {(props.muscleGroups || []).map(g => (
              <span key={g} className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider bg-surface-container-high px-2 py-1 rounded">
                {g}
              </span>
            ))}
          </div>
        </div>

        {props.videoUrl ? (
          <a
            href={props.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center text-primary-fixed hover:bg-primary-container hover:text-on-primary-container transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined">play_circle</span>
          </a>
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant/30">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        )}
      </button>

      {/* Expanded content with set hierarchy */}
      {expanded && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Warmup */}
            {props.hasWarmup && props.warmupConfig && (
              <div className="flex items-center justify-between bg-surface-container-high/50 p-3 rounded-lg border-l-2 border-on-surface-variant/30">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Warmup</span>
                  <p className="font-[family-name:var(--font-headline)] text-lg font-bold">
                    {props.warmupConfig.sets} <span className="text-sm font-normal text-on-surface-variant">x</span> {props.warmupConfig.reps}
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant/60 font-medium">RPE 4-5</span>
              </div>
            )}

            {/* Feeder 1 */}
            {props.feeder1Config && (
              <div className="flex items-center justify-between bg-surface-container-high/50 p-3 rounded-lg border-l-2 border-secondary/40">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Feeder 1</span>
                  <p className="font-[family-name:var(--font-headline)] text-lg font-bold">
                    1 <span className="text-sm font-normal text-on-surface-variant">x</span> {props.feeder1Config.reps}
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant/60 font-medium">Build to load</span>
              </div>
            )}

            {/* Feeder 2 */}
            {props.feeder2Config && (
              <div className="flex items-center justify-between bg-surface-container-high/50 p-3 rounded-lg border-l-2 border-secondary/40">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Feeder 2</span>
                  <p className="font-[family-name:var(--font-headline)] text-lg font-bold">
                    1 <span className="text-sm font-normal text-on-surface-variant">x</span> {props.feeder2Config.reps}
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant/60 font-medium">Build to load</span>
              </div>
            )}

            {/* Working Set */}
            <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border-l-2 border-primary">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{renderWorkingSetLabel()}</span>
                {renderWorkingSetReps()}
              </div>
              <div className="text-right">
                {props.workingSetConfig.rest && (
                  <>
                    <span className="text-xs text-primary font-bold block">RPE 9</span>
                    <span className="text-[10px] text-on-surface-variant uppercase">{props.workingSetConfig.rest} Rest</span>
                  </>
                )}
              </div>
            </div>

            {/* Back-off */}
            {props.backoffConfig && (
              <div className="flex items-center justify-between bg-surface-container-high/50 p-3 rounded-lg border-l-2 border-tertiary/40">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Back-off</span>
                  <p className="font-[family-name:var(--font-headline)] text-lg font-bold">
                    2 <span className="text-sm font-normal text-on-surface-variant">x</span> {props.backoffConfig.reps}
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant/60 font-medium">-15% Load</span>
              </div>
            )}
          </div>

          {/* Equipment note */}
          {props.equipmentOptions && (
            <div className="pt-2">
              <p className="text-xs text-on-surface-variant leading-relaxed italic">
                Equipamento: {props.equipmentOptions}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
