'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type Point = { score: number; dateLogged: string }

export default function TrendChart({ data }: { data: Point[] }) {
  const formatted = data.map((d, i) => ({
    idx: i + 1,
    score: d.score,
    date: new Date(d.dateLogged).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }))

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, padding: '4px 8px' }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#000000"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#FFD700', stroke: '#000', strokeWidth: 1.5 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
