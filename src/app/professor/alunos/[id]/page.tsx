'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, BookOpen } from 'lucide-react'
import api from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ProgressChart } from '@/components/student/ProgressChart'
import { formatDate, formatDuration } from '@/utils/formatters'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [noteSessionId, setNoteSessionId] = useState('')
  const [noteText, setNoteText] = useState('')
  const [programs, setPrograms] = useState<any[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      api.get(`/trainer/students/${params.id}`)
        .then(r => setStudent(r.data))
        .catch(console.error)
        .finally(() => setLoading(false))

      api.get('/trainer/programs')
        .then(r => setPrograms(r.data?.data || []))
        .catch(() => {})
    }
  }, [params.id])

  const handleAddNote = async () => {
    setSaving(true)
    try {
      await api.post(`/trainer/students/${params.id}`, { sessionId: noteSessionId, note: noteText })
      setShowNoteModal(false)
      setNoteText('')
      // Reload student
      const r = await api.get(`/trainer/students/${params.id}`)
      setStudent(r.data)
    } catch {} finally { setSaving(false) }
  }

  const handleAssignProgram = async () => {
    setSaving(true)
    try {
      await api.put(`/trainer/students/${params.id}`, {
        programId: selectedProgramId,
        startDate: new Date().toISOString(),
      })
      setShowAssignModal(false)
      const r = await api.get(`/trainer/students/${params.id}`)
      setStudent(r.data)
    } catch {} finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 text-center text-white/35">Carregando...</div>
  if (!student) return <div className="p-8 text-center text-white/35">Aluno não encontrado</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-md">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 gradient-cta text-white rounded-full flex items-center justify-center text-xl font-bold">
            {student.user?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] uppercase tracking-wider">{student.user?.name}</h1>
            <p className="text-sm text-white/35">{student.user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAssignModal(true)} className="ghost-border rounded-md text-[#ff8e80] font-semibold uppercase tracking-wider px-4 py-2 text-sm flex items-center gap-2">
            <BookOpen size={16} /> Atribuir Programa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessões', value: student.stats?.totalSessions || 0 },
          { label: 'Avaliação Média', value: student.stats?.averageRating?.toFixed(1) || '—' },
          { label: 'Streak', value: `${student.stats?.streak || 0} dias` },
        ].map(s => (
          <div key={s.label} className="bg-[#131313] rounded-md p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">{s.label}</p>
            <p className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Active Program */}
      {student.activeProgram && (
        <div className="bg-[#131313] rounded-md p-6">
          <h2 className="text-lg font-semibold text-white mb-2 font-[family-name:var(--font-heading)] uppercase tracking-wider">Programa Ativo</h2>
          <p className="text-white/60">{student.activeProgram.programName}</p>
          <p className="text-sm text-white/35 mt-1">
            Início: {student.activeProgram.startDate ? formatDate(student.activeProgram.startDate) : '—'}
          </p>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-[#131313] rounded-md p-6">
        <h2 className="text-lg font-semibold text-white mb-4 font-[family-name:var(--font-heading)] uppercase tracking-wider">Sessões Recentes</h2>
        {student.recentSessions?.length > 0 ? (
          <div className="space-y-3">
            {student.recentSessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {session.workoutName || 'Treino'}
                  </p>
                  <p className="text-xs text-white/35">{formatDate(session.startedAt)}</p>
                  {session.trainerNote && (
                    <p className="text-xs text-blue-400 mt-1 italic">📝 {session.trainerNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {session.duration && (
                    <span className="text-xs text-white/35">{formatDuration(session.duration)}</span>
                  )}
                  <button
                    onClick={() => { setNoteSessionId(session.id); setShowNoteModal(true) }}
                    className="p-1.5 hover:bg-white/5 rounded-md"
                    title="Adicionar nota"
                  >
                    <MessageSquare size={16} className="text-white/35" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/35">Nenhuma sessão registrada</p>
        )}
      </div>

      {/* PRs */}
      {student.personalRecords?.length > 0 && (
        <div className="bg-[#131313] rounded-md p-6">
          <h2 className="text-lg font-semibold text-white mb-4 font-[family-name:var(--font-heading)] uppercase tracking-wider">Recordes Pessoais</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {student.personalRecords.map((pr: any) => (
              <div key={pr.id} className="bg-[#201f1f] rounded-md p-3">
                <p className="text-xs text-white/35 truncate">{pr.exerciseName}</p>
                <p className="text-lg font-bold text-white">{pr.weight}kg × {pr.reps}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note Modal */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Nota do Professor">
        <div className="space-y-4">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Observação sobre esta sessão..."
            className="w-full px-4 py-3 bg-[#131313] text-white rounded-md resize-none h-24 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
          <button className="gradient-cta rounded-md font-semibold uppercase tracking-wider text-white w-full py-3" onClick={handleAddNote} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Nota'}
          </button>
        </div>
      </Modal>

      {/* Assign Program Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Atribuir Programa">
        <div className="space-y-4">
          <select
            value={selectedProgramId}
            onChange={e => setSelectedProgramId(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#131313] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="">Selecione um programa</option>
            {programs.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} ({p.durationWeeks} semanas)</option>
            ))}
          </select>
          <button className="gradient-cta rounded-md font-semibold uppercase tracking-wider text-white w-full py-3 disabled:opacity-50" onClick={handleAssignProgram} disabled={saving || !selectedProgramId}>
            {saving ? 'Atribuindo...' : 'Atribuir Programa'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
