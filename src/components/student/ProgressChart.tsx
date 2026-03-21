'use client'

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatDateShort } from '@/utils/formatters'

interface ProgressChartProps {
  data: { date: string; weight: number; reps?: number }[]
  color?: string
  yAxisLabel?: string
}

export function ProgressChart({ data, color = '#ff8e80', yAxisLabel = 'Carga (kg)' }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-[#131313] rounded-md">
        <p className="text-sm text-white/35">Sem dados para exibir</p>
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    dateLabel: formatDateShort(d.date),
  }))

  return (
    <div className="bg-[#131313] rounded-md p-4">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#201f1f" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            stroke="#201f1f"
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            stroke="#201f1f"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#2c2c2c',
              border: 'none',
              borderRadius: '6px',
              color: '#FAFAFA',
              fontSize: '13px',
              padding: '8px 12px',
            }}
            formatter={(value: unknown, name: unknown) => {
              const v = String(value)
              const n = String(name)
              if (n === 'weight') return [`${v} kg`, 'Carga']
              if (n === 'reps') return [v, 'Reps']
              return [v, n]
            }}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace('#', '')})`}
            dot={{ r: 4, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: color, stroke: '#FAFAFA', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
