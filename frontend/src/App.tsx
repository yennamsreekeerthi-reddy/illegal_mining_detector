import { useMemo, useState } from 'react'
import DetectionResult from './components/DetectionResult'
import EnvironmentalImpact from './components/EnvironmentalImpact'
import DisturbancePieChart from './components/charts/DisturbancePieChart'
import EnvironmentalImpactBarChart from './components/charts/EnvironmentalImpactBarChart'
import EnvironmentalImpactRadarChart from './components/charts/EnvironmentalImpactRadarChart'
import MiningTimelineChart from './components/charts/MiningTimelineChart'
import RiskGaugeChart from './components/charts/RiskGaugeChart'
import RiskIndicator from './components/RiskIndicator'
import ImageUploader from './components/ImageUploader'
import type { DetectionResultData } from './types/detection'

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to parse uploaded image.'))
    reader.readAsDataURL(file)
  })

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DetectionResultData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string>('')
  const [uploadedFileName, setUploadedFileName] = useState<string>('')

  const analyzeImage = async (file: File) => {
    setLoading(true)
    setErrorMessage('')

    try {
      setUploadedImageDataUrl(await toDataUrl(file))
      setUploadedFileName(file.name)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/analyze-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Unable to analyze image. Please check backend server status.')
      }

      const payload: DetectionResultData = await response.json()
      setResult(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error while analyzing image.'
      setErrorMessage(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = useMemo(() => {
    if (!result || !result.mining_detected) {
      return {
        label: 'Stable Monitoring Zone',
        style: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
      }
    }

    if (result.risk_level === 'High Risk') {
      return {
        label: 'Critical Alert',
        style: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
      }
    }

    if (result.risk_level === 'Medium Risk') {
      return {
        label: 'Moderate Alert',
        style: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
      }
    }

    return {
      label: 'Low Alert',
      style: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    }
  }, [result])

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <main className="mx-auto max-w-7xl">

        <header className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-panel/80 p-6 shadow-glow backdrop-blur-sm md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Environmental Monitoring
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-100 sm:text-4xl">
              Illegal Mining Detection System
            </h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Professional satellite surveillance dashboard for mining disturbance intelligence and
              ecological risk assessment.
            </p>
          </div>

          <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ${statusConfig.style}`}>
            {statusConfig.label}
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-12">

          <div className="xl:col-span-4">
            <ImageUploader onAnalyze={analyzeImage} loading={loading} />
          </div>

          <div className="space-y-6 xl:col-span-8">

            <DetectionResult
              result={result}
              loading={loading}
              errorMessage={errorMessage}
              uploadedImageDataUrl={uploadedImageDataUrl}
              uploadedFileName={uploadedFileName}
            />

            <div className="grid gap-6 lg:grid-cols-2">

              <RiskIndicator
                riskLevel={result?.risk_level ?? 'No Mining'}
              />

              <EnvironmentalImpactBarChart
                impact={result?.environmental_impact}
                miningDetected={Boolean(result?.mining_detected)}
              />

            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          <DisturbancePieChart disturbedRatio={result?.disturbed_ratio ?? 0} />

          <RiskGaugeChart
            riskLevel={result?.risk_level}
            miningDetected={Boolean(result?.mining_detected)}
          />

          <div>
            <EnvironmentalImpactRadarChart impact={result?.environmental_impact} />
          </div>

        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MiningTimelineChart
              disturbedRatio={result?.disturbed_ratio ?? 0}
              riskLevel={result?.risk_level}
            />
          </div>

          <div className="rounded-2xl bg-panel/90 p-5 shadow-glow backdrop-blur-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Satellite Image Metadata</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                <p className="text-slate-400">Disturbed Land Area</p>
                <p className="text-lg font-semibold text-amber-300">
                  {result?.metadata?.disturbed_land_area_percentage?.toFixed(2) ?? '0.00'}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                <p className="text-slate-400">Estimated Severity Score</p>
                <p className="text-lg font-semibold text-rose-300">
                  {result?.metadata?.estimated_mining_severity_score?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                <p className="text-slate-400">Image Resolution</p>
                <p className="text-base font-semibold text-cyan-300">{result?.metadata?.image_resolution ?? '--'}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                <p className="text-slate-400">Analysis Timestamp (UTC)</p>
                <p className="text-xs font-semibold text-slate-200 break-all">{result?.metadata?.analysis_timestamp ?? '--'}</p>
              </div>
            </div>
          </div>

        </section>

        <section className="mt-6">
          <EnvironmentalImpact
            riskLevel={result?.risk_level}
            miningDetected={result?.mining_detected ?? false}
          />
        </section>

        <footer className="mt-8 text-center text-sm text-slate-400">
          Powered by React + TailwindCSS + FastAPI + OpenCV + Recharts
        </footer>

      </main>
    </div>
  )
}

export default App