'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, Edit2, Trash2, Play, Dumbbell } from 'lucide-react'
import api from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

interface Exercise {
  id: string
  name: string
  equipmentOptions: string | null
  muscleGroups: string[]
  videoUrl: string | null
  instructions: string | null
}

export default function ExerciciosPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', equipmentOptions: '', muscleGroups: '', videoUrl: '', instructions: ''
  })
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const loadExercises = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (muscleFilter) params.set('muscleGroup', muscleFilter)
    api.get(`/trainer/exercises?${params}`)
      .then(r => setExercises(r.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(loadExercises, [search, muscleFilter])

  // Get unique muscle groups for filter
  const allMuscleGroups = [...new Set(exercises.flatMap(e => e.muscleGroups || []))].sort()

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: '', equipmentOptions: '', muscleGroups: '', videoUrl: '', instructions: '' })
    setShowModal(true)
  }

  const openEdit = (ex: Exercise) => {
    setEditingId(ex.id)
    setForm({
      name: ex.name,
      equipmentOptions: ex.equipmentOptions || '',
      muscleGroups: ex.muscleGroups.join(', '),
      videoUrl: ex.videoUrl || '',
      instructions: ex.instructions || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        name: form.name,
        equipmentOptions: form.equipmentOptions || null,
        muscleGroups: form.muscleGroups.split(',').map(s => s.trim()).filter(Boolean),
        videoUrl: form.videoUrl || null,
        instructions: form.instructions || null,
      }
      if (editingId) {
        await api.put(`/trainer/exercises/${editingId}`, data)
        showToast('Exercício atualizado!', 'success')
      } else {
        await api.post('/trainer/exercises', data)
        showToast('Exercício criado!', 'success')
      }
      setShowModal(false)
      loadExercises()
    } catch { showToast('Erro ao salvar', 'error') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este exercício?')) return
    try {
      await api.delete(`/trainer/exercises/${id}`)
      showToast('Exercício excluído', 'success')
      loadExercises()
    } catch(err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      showToast(axiosErr.response?.data?.error || 'Erro ao excluir', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] uppercase tracking-wider">Exercícios</h1>
        <button onClick={openCreate} className="gradient-cta rounded-md font-semibold uppercase tracking-wider text-white px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> Novo Exercício
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar exercício..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#131313] text-white rounded-md text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        <select
          value={muscleFilter}
          onChange={e => setMuscleFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#131313] text-white rounded-md text-sm focus:outline-none"
        >
          <option value="">Todos os músculos</option>
          {allMuscleGroups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="bg-[#131313] rounded-md overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="flex-1">
                  <Skeleton width="50%" height={16} />
                  <div className="flex gap-1 mt-2">
                    <Skeleton width={60} height={20} />
                    <Skeleton width={60} height={20} />
                  </div>
                </div>
                <Skeleton width={24} height={24} />
              </div>
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="p-8 text-center text-white/35">
            <Dumbbell size={32} className="mx-auto mb-2 opacity-50" />
            <p>{search || muscleFilter ? 'Nenhum exercício encontrado' : 'Nenhum exercício cadastrado'}</p>
          </div>
        ) : (
          <div className="space-y-0">
            {exercises.map(ex => (
              <div key={ex.id} className="flex items-center gap-4 p-4 hover:bg-white/5">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{ex.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(ex.muscleGroups || []).map(g => (
                      <Badge key={g} size="sm" color="#6B7280">{g}</Badge>
                    ))}
                  </div>
                  {ex.equipmentOptions && (
                    <p className="text-xs text-white/35 mt-1">🏋️ {ex.equipmentOptions}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {ex.videoUrl && (
                    <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/5 rounded-md">
                      <Play size={16} className="text-red-500" />
                    </a>
                  )}
                  <button onClick={() => openEdit(ex)} className="p-1.5 hover:bg-white/5 rounded-md">
                    <Edit2 size={16} className="text-white/35" />
                  </button>
                  <button onClick={() => handleDelete(ex.id)} className="p-1.5 hover:bg-white/5 rounded-md">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Editar Exercício' : 'Novo Exercício'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Ex: Supino Reto" />
          <Input label="Equipamento" value={form.equipmentOptions} onChange={e => setForm(p => ({...p, equipmentOptions: e.target.value}))} placeholder="Ex: Smith / Livre / Halter" />
          <Input label="Grupos Musculares (separados por vírgula)" value={form.muscleGroups} onChange={e => setForm(p => ({...p, muscleGroups: e.target.value}))} placeholder="Ex: Peito, Tríceps, Ombro" />
          <Input label="Link do Vídeo" value={form.videoUrl} onChange={e => setForm(p => ({...p, videoUrl: e.target.value}))} placeholder="https://youtube.com/..." />
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Instruções</label>
            <textarea
              value={form.instructions}
              onChange={e => setForm(p => ({...p, instructions: e.target.value}))}
              placeholder="Descrição da execução..."
              className="w-full px-4 py-2.5 bg-[#131313] rounded-md text-white placeholder-white/20 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-[box-shadow] duration-200"
            />
          </div>
          <button className="gradient-cta rounded-md font-semibold uppercase tracking-wider text-white w-full py-3" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Exercício'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
