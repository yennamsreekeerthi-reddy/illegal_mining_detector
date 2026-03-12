import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface DisturbancePieChartProps {
  disturbedRatio: number
}

const COLORS = ['#ef4444', '#22c55e']

function DisturbancePieChart({ disturbedRatio }: DisturbancePieChartProps) {
  const disturbed = Math.max(0, Math.min(100, disturbedRatio * 100))
  const undisturbed = Math.max(0, 100 - disturbed)

  const data = [
    { name: 'Disturbed Land', value: Number(disturbed.toFixed(2)) },
    { name: 'Undisturbed Land', value: Number(undisturbed.toFixed(2)) },
  ]

  return (
    <section className="rounded-2xl bg-panel/90 p-5 shadow-glow backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Disturbance Distribution</h3>
        <p className="mt-1 text-xs text-slate-400">Disturbed vs intact ground cover in analyzed imagery.</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(100, 116, 139, 0.4)',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3">
          <p className="text-slate-300">Disturbed Land</p>
          <p className="mt-1 text-base font-semibold text-rose-300">{disturbed.toFixed(2)}%</p>
        </div>
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
          <p className="text-slate-300">Undisturbed Land</p>
          <p className="mt-1 text-base font-semibold text-emerald-300">{undisturbed.toFixed(2)}%</p>
        </div>
      </div>
    </section>
  )
}

export default DisturbancePieChart