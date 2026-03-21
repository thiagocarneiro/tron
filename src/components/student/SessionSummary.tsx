'use client'

import { useState } from 'react'
import { Star, Clock, Dumbbell, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatDuration, formatWeight } from '@/utils/formatters'

interface NewPR {
  exerciseName: string
  weight: number
  reps: number
}

interface SessionSummaryProps {
  isOpen: boolean
  duration: number // seconds
  exercisesCompleted: number
  totalExercises: number
  totalVolume: number
  newPRs: NewPR[]
  onSubmit: (data: { rating: number; rpe: number; notes: string }) => void
  loading?: boolean
}

export function SessionSummary({
  isOpen,
  duration,
  exercisesCompleted,
  totalExercises,
  totalVolume,
  newPRs,
  onSubmit,
  loading,
}: SessionSummaryProps) {
  const [rating, setRating] = useState(0)
  const [rpe, setRpe] = useState(5)
  const [notes, setNotes] = useState('')

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Treino Finalizado!" size="md">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#131313] rounded-md p-3 text-center">
            <Clock size={20} className="mx-auto text-blue-400 mb-1" />
            <p className="text-lg font-bold font-[family-name:var(--font-heading)] tabular-nums text-white">{formatDuration(duration)}</p>
            <p className="text-[9px] font-semibold text-white/35 uppercase tracking-widest">Duração</p>
          </div>
          <div className="bg-[#131313] rounded-md p-3 text-center">
            <Dumbbell size={20} className="mx-auto text-green-400 mb-1" />
            <p className="text-lg font-bold font-[family-name:var(--font-heading)] tabular-nums text-white">{exercisesCompleted}/{totalExercises}</p>
            <p className="text-[9px] font-semibold text-white/35 uppercase tracking-widest">Exercícios</p>
          </div>
          <div className="bg-[#131313] rounded-md p-3 text-center">
            <TrendingUp size={20} className="mx-auto text-purple-400 mb-1" />
            <p className="text-lg font-bold font-[family-name:var(--font-heading)] tabular-nums text-white">{formatWeight(totalVolume)}</p>
            <p className="text-[9px] font-semibold text-white/35 uppercase tracking-widest">Volume Total</p>
          </div>
          <div className="bg-[#131313] rounded-md p-3 text-center">
            <Star size={20} className="mx-auto text-amber-400 mb-1" />
            <p className="text-lg font-bold font-[family-name:var(--font-heading)] tabular-nums text-white">{newPRs.length}</p>
            <p className="text-[9px] font-semibold text-white/35 uppercase tracking-widest">Novos PRs</p>
          </div>
        </div>

        {/* New PRs */}
        {newPRs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[9px] font-semibold uppercase tracking-widest text-amber-400">Recordes Pessoais</h4>
            {newPRs.map((pr, i) => (
              <div key={i} className="flex items-center justify-between bg-amber-500/10 rounded-md px-3 py-2">
                <span className="text-sm text-white">{pr.exerciseName}</span>
                <span className="text-sm font-bold font-[family-name:var(--font-heading)] tabular-nums text-white">{pr.weight}kg × {pr.reps}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-[9px] font-semibold uppercase tracking-widest text-white/35 mb-2">Como foi o treino?</label>
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5].map(i => (
              <button
                key={i}
                onClick={() => setRating(i)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <span className={i <= rating ? 'text-amber-400' : 'text-white/10'}>★</span>
              </button>
            ))}
          </div>
        </div>

        {/* RPE */}
        <div>
          <label className="block text-[9px] font-semibold uppercase tracking-widest text-white/35 mb-2">
            RPE (Esforço Percebido): <span className="text-white font-bold">{rpe}</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={rpe}
            onChange={e => setRpe(parseFloat(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="flex justify-between text-[9px] text-white/25 uppercase tracking-widest mt-1">
            <span>Fácil</span>
            <span>Moderado</span>
            <span>Máximo</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[9px] font-semibold uppercase tracking-widest text-white/35 mb-2">Observações</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Como você se sentiu? Algo a notar?"
            className="w-full px-4 py-2.5 bg-[#131313] rounded-md text-white placeholder-white/25 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-[#ff8e80]/30 transition-all duration-200"
          />
        </div>

        {/* Submit */}
        <button
          onClick={() => onSubmit({ rating, rpe, notes })}
          disabled={loading}
          className="w-full py-3 rounded-md bg-gradient-to-r from-[#FF3B30] to-[#ff8e80] text-white font-semibold text-sm uppercase tracking-wider transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,59,48,0.3)] disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar e Finalizar'}
        </button>
      </div>
    </Modal>
  )
}
