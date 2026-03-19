'use client'

import { useEffect, useState } from 'react'
import { Plus, Camera, Scale, Ruler, RefreshCw } from 'lucide-react'
import api from '@/api/client'
import { ProgressChart } from '@/components/student/ProgressChart'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { formatDate, cn } from '@/utils/formatters'

interface Measurement {
  id: string
  date: string
  weight: number | null
  bodyFat: number | null
  chest: number | null
  waist: number | null
  hips: number | null
  leftArm: number | null
  rightArm: number | null
  leftThigh: number | null
  rightThigh: number | null
  leftCalf: number | null
  rightCalf: number | null
  neck: number | null
  shoulders: number | null
}

interface Photo {
  id: string
  imageUrl: string
  angle: string
  date: string
  notes: string | null
}

const metricOptions = [
  { key: 'weight', label: 'Peso (kg)', color: '#30D158' },
  { key: 'bodyFat', label: 'Gordura (%)', color: '#AF52DE' },
  { key: 'chest', label: 'Peitoral', color: '#FF9500' },
  { key: 'waist', label: 'Cintura', color: '#FF3B30' },
  { key: 'hips', label: 'Quadril', color: '#5AC8FA' },
  { key: 'leftArm', label: 'Braço E', color: '#FFD60A' },
  { key: 'rightArm', label: 'Braço D', color: '#FFD60A' },
  { key: 'shoulders', label: 'Ombros', color: '#FF6482' },
]

const measurementFields = [
  { key: 'weight', label: 'Peso (kg)', step: '0.1' },
  { key: 'bodyFat', label: 'Gordura Corporal (%)', step: '0.1' },
  { key: 'chest', label: 'Peitoral (cm)', step: '0.5' },
  { key: 'waist', label: 'Cintura (cm)', step: '0.5' },
  { key: 'hips', label: 'Quadril (cm)', step: '0.5' },
  { key: 'leftArm', label: 'Braço Esquerdo (cm)', step: '0.5' },
  { key: 'rightArm', label: 'Braço Direito (cm)', step: '0.5' },
  { key: 'leftThigh', label: 'Coxa Esquerda (cm)', step: '0.5' },
  { key: 'rightThigh', label: 'Coxa Direita (cm)', step: '0.5' },
  { key: 'leftCalf', label: 'Panturrilha E (cm)', step: '0.5' },
  { key: 'rightCalf', label: 'Panturrilha D (cm)', step: '0.5' },
  { key: 'neck', label: 'Pescoço (cm)', step: '0.5' },
  { key: 'shoulders', label: 'Ombros (cm)', step: '0.5' },
]

export default function CorpoPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [chartData, setChartData] = useState<{date:string;weight:number}[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedMetric, setSelectedMetric] = useState('weight')
  const [showMeasurementModal, setShowMeasurementModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [measurementForm, setMeasurementForm] = useState<Record<string, string>>({})
  const [photoAngle, setPhotoAngle] = useState('FRONT')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const loadData = () => {
    setLoading(true)
    setError(false)
    Promise.all([
      api.get('/student/measurements?limit=20').then(r => setMeasurements(r.data?.measurements || r.data || [])),
      api.get('/student/measurements?chart=true').then(r => {
        const data = r.data?.data || r.data || []
        setChartData(data)
      }),
      api.get('/student/photos').then(r => setPhotos(r.data || [])),
    ]).catch(() => setError(true)).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  // Update chart when metric changes
  useEffect(() => {
    const data = measurements
      .filter(m => (m as unknown as Record<string, unknown>)[selectedMetric] != null)
      .map(m => ({ date: m.date, weight: (m as unknown as Record<string, unknown>)[selectedMetric] as number }))
      .reverse()
    setChartData(data)
  }, [selectedMetric, measurements])

  const handleSaveMeasurement = async () => {
    const hasValues = Object.values(measurementForm).some(v => v && v !== '')
    if (!hasValues) {
      showToast('Preencha pelo menos uma medida', 'error')
      return
    }

    setSaving(true)
    try {
      const data: Record<string, number> = {}
      for (const [key, value] of Object.entries(measurementForm)) {
        if (value) data[key] = parseFloat(value)
      }
      await api.post('/student/measurements', data)
      showToast('Medição salva com sucesso!', 'success')
      setShowMeasurementModal(false)
      setMeasurementForm({})
      // Reload
      const res = await api.get('/student/measurements?limit=20')
      setMeasurements(res.data?.measurements || res.data || [])
    } catch {
      showToast('Erro ao salvar medição', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Foto muito grande. Máximo 5MB.', 'error')
      return
    }

    setSaving(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await api.post('/student/photos', {
          imageData: reader.result as string,
          angle: photoAngle,
          date: new Date().toISOString(),
        })
        showToast('Foto salva!', 'success')
        setShowPhotoModal(false)
        const res = await api.get('/student/photos')
        setPhotos(res.data || [])
      } catch {
        showToast('Erro ao salvar foto', 'error')
      } finally {
        setSaving(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const selectedMetricInfo = metricOptions.find(o => o.key === selectedMetric)

  if (loading) {
    return (
      <div className="p-4 space-y-6 safe-top animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton width={100} height={28} />
          <div className="flex gap-2">
            <Skeleton width={80} height={32} />
            <Skeleton width={80} height={32} />
          </div>
        </div>
        <div className="flex gap-2">
          {[1,2,3,4].map(i => <Skeleton key={i} width={80} height={32} />)}
        </div>
        <Skeleton variant="rectangular" height={200} />
        <div className="space-y-2">
          {[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={60} />)}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={120} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 pt-16 text-center safe-top animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Ruler size={28} className="text-red-400" />
        </div>
        <p className="text-white font-medium mb-1">Erro ao carregar dados</p>
        <p className="text-sm text-[#666] mb-4">Não foi possível carregar suas medições.</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] text-white rounded-xl text-sm transition-colors"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 safe-top animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Corpo</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowMeasurementModal(true)}>
            <Scale size={16} /> Medir
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowPhotoModal(true)}>
            <Camera size={16} /> Foto
          </Button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {metricOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelectedMetric(opt.key)}
            className={cn(
              'flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 touch-target',
              selectedMetric === opt.key
                ? 'text-white shadow-lg'
                : 'bg-[#1a1a1a] text-[#666] border border-[#2a2a2a] hover:bg-[#1f1f1f]'
            )}
            style={selectedMetric === opt.key ? {
              backgroundColor: opt.color,
              boxShadow: `0 4px 15px ${opt.color}40`,
            } : undefined}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ProgressChart
        data={chartData}
        color={selectedMetricInfo?.color || '#30D158'}
        yAxisLabel={selectedMetricInfo?.label}
      />

      {/* Measurements History */}
      <div>
        <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">Histórico de Medições</h2>
        {measurements.length > 0 ? (
          <div className="space-y-2">
            {measurements.slice(0, 5).map((m, i) => {
              const prev = measurements[i + 1]
              return (
                <Card key={m.id} padding="sm" hoverable>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#666]">{formatDate(m.date)}</p>
                    <div className="flex gap-3">
                      {m.weight != null && (
                        <div className="text-right">
                          <p className="text-sm font-bold">{m.weight}kg</p>
                          {prev?.weight != null && (
                            <p className={cn(
                              'text-[10px] font-medium',
                              m.weight - prev.weight > 0 ? 'text-red-400' : m.weight - prev.weight < 0 ? 'text-green-400' : 'text-[#555]'
                            )}>
                              {m.weight - prev.weight > 0 ? '+' : ''}{(m.weight - prev.weight).toFixed(1)}
                            </p>
                          )}
                        </div>
                      )}
                      {m.bodyFat != null && (
                        <div className="text-right">
                          <p className="text-sm font-bold">{m.bodyFat}%</p>
                          <p className="text-[10px] text-[#555]">gordura</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Scale}
            title="Nenhuma medição registrada"
            description="Registre suas medidas para acompanhar sua evolução."
            action={{ label: 'Nova Medição', onClick: () => setShowMeasurementModal(true) }}
          />
        )}
      </div>

      {/* Photos */}
      <div>
        <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">Fotos de Progresso</h2>
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map(photo => (
              <div key={photo.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1a1a] group">
                <img src={photo.imageUrl} alt={`Foto ${photo.angle}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                  <Badge size="sm">{photo.angle === 'FRONT' ? 'Frente' : photo.angle === 'SIDE' ? 'Lateral' : 'Costas'}</Badge>
                  <p className="text-[10px] text-[#a0a0a0] mt-0.5">{formatDate(photo.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Camera}
            title="Nenhuma foto registrada"
            description="Registre fotos do seu progresso corporal."
            action={{ label: 'Nova Foto', onClick: () => setShowPhotoModal(true) }}
          />
        )}
      </div>

      {/* Measurement Modal */}
      <Modal isOpen={showMeasurementModal} onClose={() => setShowMeasurementModal(false)} title="Nova Medição" size="lg">
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {measurementFields.map(field => (
            <Input
              key={field.key}
              label={field.label}
              type="number"
              step={field.step}
              value={measurementForm[field.key] || ''}
              onChange={e => setMeasurementForm(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder="0"
            />
          ))}
        </div>
        <div className="mt-4">
          <Button fullWidth loading={saving} onClick={handleSaveMeasurement}>
            Salvar Medição
          </Button>
        </div>
      </Modal>

      {/* Photo Modal */}
      <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} title="Nova Foto" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Ângulo</label>
            <div className="flex gap-2">
              {[
                { key: 'FRONT', label: 'Frente' },
                { key: 'SIDE', label: 'Lateral' },
                { key: 'BACK', label: 'Costas' },
              ].map(angle => (
                <button
                  key={angle.key}
                  onClick={() => setPhotoAngle(angle.key)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    photoAngle === angle.key
                      ? 'bg-[#FF3B30] text-white shadow-lg shadow-red-500/20'
                      : 'bg-[#252525] text-[#666] hover:bg-[#2a2a2a]'
                  )}
                >
                  {angle.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block cursor-pointer">
            <div className="flex items-center justify-center h-32 bg-[#252525] border-2 border-dashed border-[#333] rounded-xl hover:border-[#FF3B30] hover:bg-[#1a0a0a] transition-all duration-200">
              <div className="text-center">
                <Camera size={24} className="mx-auto text-[#555] mb-2" />
                <p className="text-sm text-[#555]">Toque para selecionar</p>
                <p className="text-[10px] text-[#444] mt-1">Máximo 5MB</p>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={saving}
            />
          </label>
          {saving && (
            <div className="flex items-center justify-center gap-2 text-sm text-[#a0a0a0]">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#FF3B30]" />
              Enviando foto...
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
