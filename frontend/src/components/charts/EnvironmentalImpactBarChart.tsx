import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { EnvironmentalImpactMetrics } from '../../types/detection'

interface EnvironmentalImpactBarChartProps {
  impact?: EnvironmentalImpactMetrics
  miningDetected: boolean
}

function EnvironmentalImpactBarChart({ impact, miningDetected }: EnvironmentalImpactBarChartProps) {
  const metrics: EnvironmentalImpactMetrics = impact ?? {
    vegetation_loss: 0,
    soil_erosion_risk: 0,
    water_pollution_risk: 0,
    habitat_damage: 0,
  }

  const data = [
    { name: 'Vegetation Loss', value: metrics.vegetation_loss },
    { name: 'Soil Erosion', value: metrics.soil_erosion_risk },
    { name: 'Water Pollution', value: metrics.water_pollution_risk },
    { name: 'Habitat Damage', value: metrics.habitat_damage },
  ]

  return (
    <section className="rounded-2xl bg-panel/90 p-5 shadow-glow backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Environmental Impact Metrics</h3>
        <p className="mt-1 text-xs text-slate-400">
          Estimated ecological stress indicators derived from disturbed land proportion.
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 6, left: -16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.45} />
            <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={48} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              formatter={(value) => `${Number(value ?? 0).toFixed(1)}%`}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(100, 116, 139, 0.4)',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
              }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              fill={miningDetected ? '#38bdf8' : '#22c55e'}
              maxBarSize={46}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default EnvironmentalImpactBarChart