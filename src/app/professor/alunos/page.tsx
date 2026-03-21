'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, Users } from 'lucide-react'
import api from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
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
      .then(r => setStudents(r.data?.data || []))
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
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] uppercase tracking-wider">Alunos</h1>
        <Badge color="#3B82F6" size="md">{students.length} alunos</Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#131313] text-white rounded-md text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#131313] text-white rounded-md text-sm focus:outline-none"
        >
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Students list */}
      <div className="bg-[#131313] rounded-md overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="60%" height={12} className="mt-1" />
                </div>
                <Skeleton width={60} height={24} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title={search ? 'Nenhum aluno encontrado' : 'Nenhum aluno vinculado'}
              description={search ? 'Tente buscar por outro nome ou email.' : 'Seus alunos aparecerão aqui.'}
            />
          </div>
        ) : (
          <div className="space-y-0">
            {filtered.map(student => (
              <Link
                key={student.id}
                href={`/professor/alunos/${student.id}`}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 gradient-cta text-white rounded-full flex items-center justify-center font-bold">
                  {student.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{student.user.name}</p>
                  <p className="text-sm text-white/35 truncate">{student.user.email}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-white/60">{student.sessionsThisMonth} sessões/mês</p>
                  <p className="text-xs text-white/35">
                    {student.lastSession ? `Último: ${formatDate(student.lastSession)}` : 'Sem sessões'}
                  </p>
                </div>
                <Badge
                  color={student.status === 'active' ? '#22C55E' : '#EF4444'}
                  size="sm"
                >
                  {student.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
                <ChevronRight size={18} className="text-white/35" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
