'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Copy, Trash2, ChevronRight, BookOpen } from 'lucide-react'
import api from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function ProgramasPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', durationWeeks: '16' })
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const loadPrograms = () => {
    api.get('/trainer/programs')
      .then(r => setPrograms(r.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(loadPrograms, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await api.post('/trainer/programs', {
        name: formData.name,
        description: formData.description,
        durationWeeks: parseInt(formData.durationWeeks),
      })
      showToast('Programa criado!', 'success')
      setShowCreateModal(false)
      setFormData({ name: '', description: '', durationWeeks: '16' })
      loadPrograms()
    } catch { showToast('Erro ao criar programa', 'error') } finally { setSaving(false) }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/trainer/programs/${id}`)
      showToast('Programa duplicado!', 'success')
      loadPrograms()
    } catch { showToast('Erro ao duplicar', 'error') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este programa?')) return
    try {
      await api.delete(`/trainer/programs/${id}`)
      showToast('Programa excluído', 'success')
      loadPrograms()
    } catch { showToast('Erro ao excluir', 'error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] uppercase tracking-wider">Programas</h1>
        <button onClick={() => setShowCreateModal(true)} className="gradient-cta rounded-md font-semibold uppercase tracking-wider text-white px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> Novo Programa
        </button>
      </div>

      <div className="bg-[#131313] rounded-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/35">Carregando...</div>
        ) : programs.length === 0 ? (
          <div className="p-8 text-center text-white/35">
            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
            <p>Nenhum programa criado</p>
          </div>
        ) : (
          <div className="space-y-0">
            {programs.map(program => (
              <div key={program.id} className="flex items-center gap-4 p-4 hover:bg-white/5">
                <div className="flex-1 min-w-0">
                  <Link href={`/professor/programas/${program.id}`} className="hover:underline">
                    <p className="font-medium text-white">{program.name}</p>
                  </Link>
                  <p className="text-sm text-white/35">{program.durationWeeks} semanas</p>
                </div>
                <div className="flex items-center gap-3">
                  {program.isTemplate && <Badge color="#8B5CF6" size="sm">Template</Badge>}
                  <Badge color="#3B82F6" size="sm">{program.assignedStudents || 0} alunos</Badge>
                  <button onClick={() => handleDuplicate(program.id)} className="p-1.5 hover:bg-white/5 rounded-md" title="Duplicar">
                    <Copy size={16} className="text-white/35" />
                  </button>
                  <button onClick={() => handleDelete(program.id)} className="p-1.5 hover:bg-white/5 rounded-md" title="Excluir">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                  <Link href={`/professor/programas/${program.id}`}>
                    <ChevronRight size={18} className="text-white/35" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Novo Programa">
        <div className="space-y-4">
          <Input label="Nome" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Ex: Iniciante Masculino" />
          <Input label="Descrição" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Descrição do programa" />
          <Input label="Duração (semanas)" type="number" value={formData.durationWeeks} onChange={e => setFormData(p => ({...p, durationWeeks: e.target.value}))} />
          <button className="gradient-cta rounded-md font-semibold uppercase tracking-wider text-white w-full py-3" onClick={handleCreate} disabled={saving}>
            {saving ? 'Criando...' : 'Criar Programa'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
