import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { RiskLevel } from '../../types/detection'

interface RiskGaugeChartProps {
  riskLevel?: RiskLevel
  miningDetected: boolean
}

const riskValueMap: Record<RiskLevel, number> = {
  None: 0,
  'No Mining': 10,
  'Low Risk': 35,
  'Medium Risk': 70,
  'High Risk': 100,
}

const riskColorMap: Record<RiskLevel, string> = {
  None: '#94a3b8',
  'No Mining': '#22c55e',
  'Low Risk': '#84cc16',
  'Medium Risk': '#f59e0b',
  'High Risk': '#ef4444',
}

function RiskGaugeChart({ riskLevel, miningDetected }: RiskGaugeChartProps) {
  const activeLevel: RiskLevel = miningDetected && riskLevel ? riskLevel : 'No Mining'
  const value = miningDetected ? riskValueMap[activeLevel] : 10
  const color = miningDetected ? riskColorMap[activeLevel] : '#22c55e'

  const data = [
    { name: 'Risk', value },
    { name: 'Remaining', value: 100 - value },
  ]

  return (
    <section className="rounded-2xl bg-panel/90 p-5 shadow-glow backdrop-blur-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Risk Gauge</h3>
      <div className="mt-2 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              startAngle={180}
              endAngle={0}
              cx="50%"
              cy="90%"
              innerRadius={62}
              outerRadius={86}
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#1f2937" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-10 text-center">
        <p className="text-xs text-slate-400">Current Risk Level</p>
        <p className="text-xl font-bold" style={{ color }}>
          {miningDetected ? activeLevel : 'No Risk'}
        </p>
      </div>
    </section>
  )
}

export default RiskGaugeChart
