'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDateShort } from '@/utils/formatters'

interface ProgressChartProps {
  data: { date: string; weight: number; reps?: number }[]
  color?: string
  yAxisLabel?: string
}

export function ProgressChart({ data, color = '#FF3B30', yAxisLabel = 'Carga (kg)' }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
        <p className="text-sm text-[#555]">Sem dados para exibir</p>
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    dateLabel: formatDateShort(d.date),
  }))

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-4">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: '#555', fontSize: 11 }}
            stroke="#2a2a2a"
          />
          <YAxis
            tick={{ fill: '#555', fontSize: 11 }}
            stroke="#2a2a2a"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(value: unknown, name: unknown) => {
              const v = String(value)
              const n = String(name)
              if (n === 'weight') return [`${v} kg`, 'Carga']
              if (n === 'reps') return [v, 'Reps']
              return [v, n]
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
