import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { EnvironmentalImpactMetrics } from '../../types/detection'

interface EnvironmentalImpactRadarChartProps {
  impact?: Partial<EnvironmentalImpactMetrics>
}

function EnvironmentalImpactRadarChart({ impact }: EnvironmentalImpactRadarChartProps) {
  const metrics = {
    vegetation_loss: impact?.vegetation_loss ?? 0,
    soil_erosion_risk: impact?.soil_erosion_risk ?? 0,
    water_pollution_risk: impact?.water_pollution_risk ?? 0,
    biodiversity_loss: impact?.biodiversity_loss ?? 0,
  }

  const data = [
    { metric: 'Vegetation Loss', value: metrics.vegetation_loss },
    { metric: 'Soil Erosion', value: metrics.soil_erosion_risk },
    { metric: 'Water Pollution', value: metrics.water_pollution_risk },
    { metric: 'Biodiversity Loss', value: metrics.biodiversity_loss },
  ]

  return (
    <section className="rounded-2xl bg-panel/90 p-5 shadow-glow backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Environmental Damage Radar</h3>
        <p className="mt-1 text-xs text-slate-400">Multi-dimensional ecological stress profile (0-100).</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.45} />
            <Tooltip
              formatter={(value) => `${Number(value ?? 0).toFixed(1)}%`}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(100, 116, 139, 0.4)',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default EnvironmentalImpactRadarChart
