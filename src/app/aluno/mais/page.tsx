'use client'

import { useEffect, useState } from 'react'
import { LogOut, Lock, UserPen, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react'
import api from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentPhase } from '@/hooks/useCurrentPhase'
import { getDayName, formatDate } from '@/utils/formatters'

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
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const phaseInfo = useCurrentPhase(program?.startDate || null)

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Edit profile state
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    api.get('/student/program')
      .then(r => {
        const { assignment, program } = r.data
        setProgram({
          ...program,
          startDate: assignment?.startDate,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast('Preencha todos os campos', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('Nova senha deve ter pelo menos 6 caracteres', 'error')
      return
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Senhas não coincidem', 'error')
      return
    }
    setChangingPassword(true)
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword })
      showToast('Senha alterada com sucesso!', 'success')
      setShowPasswordModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch {
      showToast('Erro ao alterar senha. Verifique a senha atual.', 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleEditProfile = async () => {
    if (!profileName.trim()) {
      showToast('Nome é obrigatório', 'error')
      return
    }
    setSavingProfile(true)
    try {
      await api.put('/student/profile', { name: profileName.trim(), phone: profilePhone.trim() || null })
      showToast('Perfil atualizado!', 'success')
      setShowProfileModal(false)
    } catch {
      showToast('Erro ao atualizar perfil', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const openProfileModal = () => {
    setProfileName(user?.name || '')
    setProfilePhone('')
    // Load current profile data
    api.get('/student/profile').then(r => {
      setProfileName(r.data.name || user?.name || '')
      setProfilePhone(r.data.phone || '')
    }).catch(() => {})
    setShowProfileModal(true)
  }

  const currentWeek = phaseInfo?.currentWeek || 1
  const currentPhaseIdx = phaseInfo ? phaseInfo.currentPhase - 1 : 0

  return (
    <div className="p-4 space-y-6 safe-top pb-24">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] uppercase tracking-wider">Mais</h1>

      {/* Phase Timeline */}
      {program?.phases && (
        <div>
          <h2 className="label-caps mb-3">Timeline do Programa</h2>
          <div className="space-y-2">
            {program.phases.map((phase, i) => {
              const isActive = i === currentPhaseIdx
              const isPast = i < currentPhaseIdx
              return (
                <div
                  key={phase.id}
                  className={`flex items-center gap-3 p-3 rounded-md transition-all ${
                    isActive
                      ? ''
                      : isPast
                        ? 'bg-[#201f1f] opacity-60'
                        : 'bg-[#201f1f]'
                  }`}
                  style={isActive ? { backgroundColor: `${phase.color}20` } : undefined}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: phase.color,
                      ...(isActive ? { boxShadow: `0 0 8px ${phase.color}` } : {}),
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={isActive ? { color: phase.color } : undefined}>
                      {phase.name}
                    </p>
                    <p className="text-xs text-white/35">Semanas {phase.weekStart}–{phase.weekEnd}</p>
                  </div>
                  {isActive && (
                    <Badge color={phase.color} size="sm">Atual</Badge>
                  )}
                  {isPast && <span className="text-xs text-white/35">✓</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weekly Rotations */}
      {program?.rotations && (
        <div>
          <h2 className="label-caps mb-3">Rotações Semanais</h2>
          <div className="space-y-3">
            {program.rotations.map(rotation => (
              <div key={rotation.id} className="bg-[#201f1f] rounded-md p-3">
                <p className="text-sm font-medium mb-2">{rotation.label}</p>
                <div className="grid grid-cols-7 gap-1">
                  {rotation.slots
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((slot, i) => (
                      <div key={i} className="text-center">
                        <p className="text-[10px] text-white/35 mb-1">{getDayName(slot.dayOfWeek)}</p>
                        <div className={`py-1 rounded-md text-xs font-medium ${
                          slot.isRest ? 'bg-[#2c2c2c] text-white/25' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {slot.displayLabel}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {program?.tips && (
        <div>
          <h2 className="label-caps mb-3">Dicas & Orientações</h2>
          <div className="space-y-2">
            {program.tips.map(tip => (
              <div key={tip.id} className="bg-[#201f1f] rounded-md p-3">
                <div className="flex gap-3">
                  <span className="text-xl">{tip.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{tip.title}</p>
                    <p className="text-xs text-white/35 mt-0.5">{tip.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile */}
      <div>
        <h2 className="label-caps mb-3">Meu Perfil</h2>
        <div className="bg-[#131313] rounded-md p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 gradient-cta rounded-full flex items-center justify-center text-xl font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-white/35">{user?.email}</p>
            </div>
          </div>
          {program?.startDate && (
            <p className="text-xs text-white/35">
              Início do programa: {formatDate(program.startDate)} · Semana {currentWeek} de {program.durationWeeks || 16}
            </p>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-2">
        <h2 className="label-caps mb-3">Conta</h2>
        <button
          onClick={openProfileModal}
          className="w-full flex items-center gap-3 p-3 bg-[#201f1f] rounded-md hover:bg-white/5 transition-colors"
        >
          <UserPen size={18} className="text-white/60" />
          <span className="text-sm font-medium flex-1 text-left">Editar Perfil</span>
          <ChevronRight size={16} className="text-white/25" />
        </button>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center gap-3 p-3 bg-[#201f1f] rounded-md hover:bg-white/5 transition-colors"
        >
          <Lock size={18} className="text-white/60" />
          <span className="text-sm font-medium flex-1 text-left">Alterar Senha</span>
          <ChevronRight size={16} className="text-white/25" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-md transition-colors"
      >
        <LogOut size={18} />
        <span className="text-sm font-medium">Sair da Conta</span>
      </button>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Alterar Senha" size="sm">
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Senha atual"
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute right-3 top-8 text-white/35 hover:text-white/60"
            >
              {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Nova senha"
              type={showNewPw ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-3 top-8 text-white/35 hover:text-white/60"
            >
              {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
            placeholder="Repita a nova senha"
          />
          <Button fullWidth loading={changingPassword} onClick={handleChangePassword}>
            Alterar Senha
          </Button>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Editar Perfil" size="sm">
        <div className="space-y-4">
          <Input
            label="Nome"
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            placeholder="Seu nome completo"
          />
          <Input
            label="Telefone"
            type="tel"
            value={profilePhone}
            onChange={e => setProfilePhone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
          <Button fullWidth loading={savingProfile} onClick={handleEditProfile}>
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
