'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import api from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/formatters'

interface Student {
  id: string
  userId: string
  user: { name: string; email: string; avatarUrl: string | null }
  startDate: string
  lastSession: string | null
  sessionsThisMonth: number
  status: string
}

export default function AlunosPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    api.get('/trainer/students')
      .then(r => setStudents(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s => {
    const matchSearch = s.user.name.toLowerCase().includes(search.toLowerCase()) ||
                       s.user.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || s.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">Alunos</h1>
        <Badge color="#3B82F6" size="md">{students.length} alunos</Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
        >
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Students list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {search ? 'Nenhum aluno encontrado' : 'Nenhum aluno vinculado'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(student => (
              <Link
                key={student.id}
                href={`/professor/alunos/${student.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                  {student.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{student.user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{student.user.email}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-600">{student.sessionsThisMonth} sessões/mês</p>
                  <p className="text-xs text-gray-400">
                    {student.lastSession ? `Último: ${formatDate(student.lastSession)}` : 'Sem sessões'}
                  </p>
                </div>
                <Badge
                  color={student.status === 'active' ? '#22C55E' : '#EF4444'}
                  size="sm"
                >
                  {student.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
                <ChevronRight size={18} className="text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
