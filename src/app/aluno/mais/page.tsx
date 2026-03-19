'use client'

import { useEffect, useState } from 'react'
import { LogOut, Lock, UserPen, Eye, EyeOff, Loader2 } from 'lucide-react'
import api from '@/api/client'
import { Card } from '@/components/ui/Card'
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
      .then(r => setProgram(r.data))
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

      {/* Account Actions */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">Conta</h2>
        <button
          onClick={openProfileModal}
          className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:bg-[#1f1f1f] transition-colors"
        >
          <UserPen size={18} className="text-[#a0a0a0]" />
          <span className="text-sm font-medium">Editar Perfil</span>
        </button>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:bg-[#1f1f1f] transition-colors"
        >
          <Lock size={18} className="text-[#a0a0a0]" />
          <span className="text-sm font-medium">Alterar Senha</span>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:text-red-300 transition-colors"
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
              className="absolute right-3 top-8 text-[#555] hover:text-[#a0a0a0]"
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
              className="absolute right-3 top-8 text-[#555] hover:text-[#a0a0a0]"
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
