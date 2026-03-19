'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Moon, Sun, ChevronRight } from 'lucide-react'
import api from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/authStore'
import { getDayName, formatDate, getCurrentWeek, getPhaseForWeek } from '@/utils/formatters'

interface ProgramData {
  phases: { id:string; weekStart:number; weekEnd:number; name:string; color:string }[]
  rotations: { id:string; label:string; slots: { dayOfWeek:number; displayLabel:string; isRest:boolean }[] }[]
  tips: { id:string; icon:string; title:string; text:string }[]
  startDate?: string
  durationWeeks?: number
}

export default function MaisPage() {
  const [program, setProgram] = useState<ProgramData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    api.get('/student/program')
      .then(r => setProgram(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    document.cookie = 'tron-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    router.push('/login')
  }

  const currentWeek = program?.startDate ? getCurrentWeek(new Date(program.startDate)) : 1
  const currentPhaseIdx = getPhaseForWeek(currentWeek) - 1

  return (
    <div className="p-4 space-y-6 safe-top pb-24">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Mais</h1>

      {/* Phase Timeline */}
      {program?.phases && (
        <div>
          <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">Timeline do Programa</h2>
          <div className="space-y-2">
            {program.phases.map((phase, i) => {
              const isActive = i === currentPhaseIdx
              const isPast = i < currentPhaseIdx
              return (
                <div
                  key={phase.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'border-transparent bg-opacity-20'
                      : isPast
                        ? 'border-[#2a2a2a] bg-[#1a1a1a] opacity-60'
                        : 'border-[#2a2a2a] bg-[#1a1a1a]'
                  }`}
                  style={isActive ? { backgroundColor: `${phase.color}20`, borderColor: phase.color } : undefined}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: phase.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={isActive ? { color: phase.color } : undefined}>
                      {phase.name}
                    </p>
                    <p className="text-xs text-[#666]">Semanas {phase.weekStart}–{phase.weekEnd}</p>
                  </div>
                  {isActive && (
                    <Badge color={phase.color} size="sm">Atual</Badge>
                  )}
                  {isPast && <span className="text-xs text-[#555]">✓</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weekly Rotations */}
      {program?.rotations && (
        <div>
          <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">Rotações Semanais</h2>
          <div className="space-y-3">
            {program.rotations.map(rotation => (
              <Card key={rotation.id} padding="sm">
                <p className="text-sm font-medium mb-2">{rotation.label}</p>
                <div className="grid grid-cols-7 gap-1">
                  {rotation.slots
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((slot, i) => (
                      <div key={i} className="text-center">
                        <p className="text-[10px] text-[#555] mb-1">{getDayName(slot.dayOfWeek)}</p>
                        <div className={`py-1 rounded text-xs font-medium ${
                          slot.isRest ? 'bg-[#252525] text-[#444]' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {slot.displayLabel}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {program?.tips && (
        <div>
          <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">Dicas & Orientações</h2>
          <div className="space-y-2">
            {program.tips.map(tip => (
              <Card key={tip.id} padding="sm">
                <div className="flex gap-3">
                  <span className="text-xl">{tip.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{tip.title}</p>
                    <p className="text-xs text-[#666] mt-0.5">{tip.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Profile */}
      <div>
        <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">Meu Perfil</h2>
        <Card padding="md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-xl font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-[#666]">{user?.email}</p>
            </div>
          </div>
          {program?.startDate && (
            <p className="text-xs text-[#666]">
              Início do programa: {formatDate(program.startDate)} · Semana {currentWeek} de {program.durationWeeks || 16}
            </p>
          )}
        </Card>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:text-red-300 transition-colors"
      >
        <LogOut size={18} />
        <span className="text-sm font-medium">Sair da Conta</span>
      </button>
    </div>
  )
}
