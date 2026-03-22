'use client'

import { useState } from 'react'
import { VideoPlayer } from './VideoPlayer'

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
  const [showVideo, setShowVideo] = useState(false)
  const [videoMounted, setVideoMounted] = useState(false)

  const renderWorkingSetLabel = () => {
    const config = props.workingSetConfig
    if (config.type === 'cluster') return 'Série Cluster'
    if (config.type === 'isometric') return 'Isométrico'
    return 'Série de Trabalho'
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

        <div className="flex items-center gap-2 flex-shrink-0">
          {props.videoUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (!showVideo) {
                  setVideoMounted(true)
                  requestAnimationFrame(() => setShowVideo(true))
                } else {
                  setShowVideo(false)
                  setTimeout(() => setVideoMounted(false), 300)
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                showVideo
                  ? 'bg-primary text-black'
                  : 'bg-surface-container-highest text-primary-fixed hover:bg-primary-container hover:text-on-primary-container'
              }`}
            >
              <span className="material-symbols-outlined">{showVideo ? 'close' : 'play_circle'}</span>
            </button>
          )}
          <span className="material-symbols-outlined text-on-surface-variant/30">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {/* Inline video player */}
      {props.videoUrl && videoMounted && (
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: showVideo ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="px-5 pb-4 pt-1">
              <VideoPlayer
                url={props.videoUrl}
                title={props.name}
                autoOpen
                onClose={() => {
                  setShowVideo(false)
                  setTimeout(() => setVideoMounted(false), 300)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Expanded content with set hierarchy */}
      {expanded && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Warmup */}
            {props.hasWarmup && props.warmupConfig && (
              <div className="flex items-center justify-between bg-surface-container-high/50 p-3 rounded-lg border-l-2 border-on-surface-variant/30">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Aquecimento</span>
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
                <span className="text-xs text-on-surface-variant/60 font-medium">Progressão</span>
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
                <span className="text-xs text-on-surface-variant/60 font-medium">Progressão</span>
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
                    <span className="text-[10px] text-on-surface-variant uppercase">{props.workingSetConfig.rest} Desc.</span>
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
                <span className="text-xs text-on-surface-variant/60 font-medium">-15% Carga</span>
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
