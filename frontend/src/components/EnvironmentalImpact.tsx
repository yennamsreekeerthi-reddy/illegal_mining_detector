import type { RiskLevel } from '../types/detection'

interface EnvironmentalImpactProps {
  riskLevel?: RiskLevel
  miningDetected: boolean
}

type ImpactPoint = {
  icon: string
  title: string
  description: string
}

const impactByLevel: Record<RiskLevel, ImpactPoint[]> = {
  'High Risk': [
    {
      icon: '🌿',
      title: 'Severe Vegetation Removal',
      description: 'Large portions of plant cover are likely cleared, reducing carbon sequestration.',
    },
    {
      icon: '🟤',
      title: 'Increased Soil Erosion',
      description: 'Exposed topsoil elevates sediment runoff and long-term land degradation.',
    },
    {
      icon: '💧',
      title: 'Potential Groundwater Contamination',
      description: 'Mining runoff can carry contaminants into local streams and aquifers.',
    },
    {
      icon: '🦉',
      title: 'Habitat Destruction',
      description: 'Ecological corridors and species habitats may be significantly disrupted.',
    },
  ],
  'Medium Risk': [
    {
      icon: '🌱',
      title: 'Partial Vegetation Disturbance',
      description: 'Localized clearing suggests active but moderate land conversion pressure.',
    },
    {
      icon: '⛰️',
      title: 'Moderate Soil Exposure',
      description: 'Surface disturbance raises near-term erosion potential during rainfall.',
    },
    {
      icon: '🚰',
      title: 'Emerging Water Quality Risk',
      description: 'Nearby water bodies may see minor contamination if excavation expands.',
    },
    {
      icon: '🛖',
      title: 'Habitat Fragmentation',
      description: 'Wildlife movement can be impacted by expanding extraction pockets.',
    },
  ],
  'Low Risk': [
    {
      icon: '🌾',
      title: 'Minor Disturbance',
      description: 'Detected changes indicate early-stage or low-intensity activity.',
    },
    {
      icon: '🧪',
      title: 'Low Erosion Threat',
      description: 'Current soil displacement is limited but should be continuously tracked.',
    },
    {
      icon: '💦',
      title: 'Low Water Pollution Risk',
      description: 'No major contamination indicators, though preventive monitoring is advised.',
    },
    {
      icon: '🐾',
      title: 'Early Habitat Pressure',
      description: 'Some ecological stress may emerge if disturbance area increases over time.',
    },
  ],
  'No Mining': [
    {
      icon: '🌍',
      title: 'No Significant Disturbance',
      description: 'Current analysis suggests the terrain remains stable with no actionable mining signatures.',
    },
    {
      icon: '🌱',
      title: 'Vegetation Largely Intact',
      description: 'Land-cover continuity appears strong with minimal indication of canopy removal.',
    },
    {
      icon: '💧',
      title: 'Low Water Stress Risk',
      description: 'No immediate indicators of runoff-linked contamination from extraction activity.',
    },
    {
      icon: '🦋',
      title: 'Biodiversity Conditions Stable',
      description: 'No major habitat fragmentation signals detected in the analyzed frame.',
    },
  ],
  None: [
    {
      icon: '🛰️',
      title: 'Image Validation Warning',
      description: 'Uploaded image may not be a valid satellite land scene for mining impact analysis.',
    },
    {
      icon: '📷',
      title: 'Re-upload Recommended',
      description: 'Use a clear satellite land image with visible terrain and surface features.',
    },
    {
      icon: '🧭',
      title: 'No Reliable Ecological Signal',
      description: 'Environmental metrics are withheld when land-scene confidence is insufficient.',
    },
    {
      icon: '🧪',
      title: 'Quality Control Triggered',
      description: 'Validation safeguards prevented false-positive mining assessment on non-land imagery.',
    },
  ],
}

function EnvironmentalImpact({ riskLevel, miningDetected }: EnvironmentalImpactProps) {
  const effectiveLevel: RiskLevel = riskLevel ?? (miningDetected ? 'Low Risk' : 'No Mining')
  const cards = impactByLevel[effectiveLevel]

  return (
    <section className="rounded-2xl bg-panel/90 p-5 shadow-glow backdrop-blur-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Environmental Impact Insights</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-slate-600">
          Assessment Level: {effectiveLevel}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-700 bg-slate-900/45 p-4 transition hover:border-cyan-400/40">
            <div className="text-2xl" aria-hidden="true">
              {item.icon}
            </div>
            <h4 className="mt-2 text-sm font-semibold text-slate-100">{item.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default EnvironmentalImpact