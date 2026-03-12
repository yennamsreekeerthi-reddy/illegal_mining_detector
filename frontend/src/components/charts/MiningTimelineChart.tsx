import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RiskLevel } from '../../types/detection'

interface MiningTimelineChartProps {
  disturbedRatio: number
  riskLevel?: RiskLevel
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

function MiningTimelineChart({ disturbedRatio, riskLevel }: MiningTimelineChartProps) {
  const baseline = Math.max(1, disturbedRatio * 100)
  const growthFactor =
    riskLevel === 'High Risk' ? 1.45 : riskLevel === 'Medium Risk' ? 1.2 : riskLevel === 'Low Risk' ? 1.1 : 1.03

  const data = months.map((month, index) => {
    const trend = baseline * Math.pow(growthFactor, index / 3)
    return {
      month,
      disturbance: Number(Math.min(100, trend).toFixed(2)),
    }
  })

  return (
    <section className="rounded-2xl bg-panel/90 p-5 shadow-glow backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Mining Disturbance Timeline (Simulated)</h3>
        <p className="mt-1 text-xs text-slate-400">Projected growth trend of disturbed land based on current detection severity.</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 6 }}>
            <defs>
              <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.45} />
            <XAxis dataKey="month" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(100, 116, 139, 0.4)',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
              }}
            />
            <Area type="monotone" dataKey="disturbance" stroke="#fb923c" strokeWidth={2} fill="url(#timelineGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default MiningTimelineChart