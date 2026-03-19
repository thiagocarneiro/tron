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
        .then(r => setPrograms(r.data || []))
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

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>
  if (!student) return <div className="p-8 text-center text-gray-400">Aluno não encontrado</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl font-bold">
            {student.user?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">{student.user?.name}</h1>
            <p className="text-sm text-gray-500">{student.user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(true)}>
            <BookOpen size={16} /> Atribuir Programa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessões', value: student.stats?.totalSessions || 0 },
          { label: 'Este Mês', value: student.stats?.sessionsThisMonth || 0 },
          { label: 'Avaliação Média', value: student.stats?.averageRating?.toFixed(1) || '—' },
          { label: 'Streak', value: `${student.stats?.currentStreak || 0} dias` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Active Program */}
      {student.activeProgram && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 font-[family-name:var(--font-heading)]">Programa Ativo</h2>
          <p className="text-gray-600">{student.activeProgram.name}</p>
          <p className="text-sm text-gray-400 mt-1">
            Início: {student.activeProgram.startDate ? formatDate(student.activeProgram.startDate) : '—'}
          </p>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 font-[family-name:var(--font-heading)]">Sessões Recentes</h2>
        {student.recentSessions?.length > 0 ? (
          <div className="space-y-3">
            {student.recentSessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.workout?.name || 'Treino'}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(session.startedAt)}</p>
                  {session.trainerNote && (
                    <p className="text-xs text-blue-500 mt-1 italic">📝 {session.trainerNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {session.duration && (
                    <span className="text-xs text-gray-400">{formatDuration(session.duration)}</span>
                  )}
                  <button
                    onClick={() => { setNoteSessionId(session.id); setShowNoteModal(true) }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                    title="Adicionar nota"
                  >
                    <MessageSquare size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nenhuma sessão registrada</p>
        )}
      </div>

      {/* PRs */}
      {student.personalRecords?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 font-[family-name:var(--font-heading)]">Recordes Pessoais</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {student.personalRecords.map((pr: any) => (
              <div key={pr.id} className="border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-500 truncate">{pr.exercise?.name}</p>
                <p className="text-lg font-bold text-gray-900">{pr.weight}kg × {pr.reps}</p>
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
          <Button fullWidth loading={saving} onClick={handleAddNote}>Salvar Nota</Button>
        </div>
      </Modal>

      {/* Assign Program Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Atribuir Programa">
        <div className="space-y-4">
          <select
            value={selectedProgramId}
            onChange={e => setSelectedProgramId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="">Selecione um programa</option>
            {programs.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} ({p.durationWeeks} semanas)</option>
            ))}
          </select>
          <Button fullWidth loading={saving} onClick={handleAssignProgram} disabled={!selectedProgramId}>
            Atribuir Programa
          </Button>
        </div>
      </Modal>
    </div>
  )
}
