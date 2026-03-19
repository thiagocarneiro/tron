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
      .then(r => setPrograms(r.data || []))
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
        <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">Programas</h1>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Novo Programa
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : programs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
            <p>Nenhum programa criado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {programs.map(program => (
              <div key={program.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <Link href={`/professor/programas/${program.id}`} className="hover:underline">
                    <p className="font-medium text-gray-900">{program.name}</p>
                  </Link>
                  <p className="text-sm text-gray-500">{program.durationWeeks} semanas</p>
                </div>
                <div className="flex items-center gap-3">
                  {program.isTemplate && <Badge color="#8B5CF6" size="sm">Template</Badge>}
                  <Badge color="#3B82F6" size="sm">{program._count?.assignments || 0} alunos</Badge>
                  <button onClick={() => handleDuplicate(program.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Duplicar">
                    <Copy size={16} className="text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(program.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Excluir">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                  <Link href={`/professor/programas/${program.id}`}>
                    <ChevronRight size={18} className="text-gray-300" />
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
          <Button fullWidth loading={saving} onClick={handleCreate}>Criar Programa</Button>
        </div>
      </Modal>
    </div>
  )
}
