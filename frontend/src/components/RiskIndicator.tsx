import type { RiskLevel } from '../types/detection'

interface RiskIndicatorProps {
  riskLevel: RiskLevel
}

const riskStyles: Record<RiskLevel, string> = {
  Low: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30',
  Medium: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30',
  High: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30',
}

function RiskIndicator({ riskLevel }: RiskIndicatorProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${riskStyles[riskLevel]}`}
    >
      {riskLevel} Risk
    </span>
  )
}

export default RiskIndicator
