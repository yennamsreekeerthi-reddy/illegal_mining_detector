import jsPDF from 'jspdf'
import RiskIndicator from './RiskIndicator'
import type { DetectionResultData } from '../types/detection'

interface DetectionResultProps {
  result: DetectionResultData | null
  loading: boolean
  errorMessage?: string
  uploadedImageDataUrl?: string
  uploadedFileName?: string
}

const statusCardMap = {
  safe: {
    icon: '🟢',
    label: 'Safe Area',
    textClass: 'text-emerald-300',
    cardClass: 'border-emerald-400/30 bg-emerald-500/10',
  },
  medium: {
    icon: '🟡',
    label: 'Moderate Risk',
    textClass: 'text-amber-300',
    cardClass: 'border-amber-400/30 bg-amber-500/10',
  },
  high: {
    icon: '🔴',
    label: 'High Risk',
    textClass: 'text-rose-300',
    cardClass: 'border-rose-400/30 bg-rose-500/10',
  },
}

function DetectionResult({
  result,
  loading,
  errorMessage,
  uploadedImageDataUrl,
  uploadedFileName,
}: DetectionResultProps) {
  const processedImageDataUrl = result?.processed_image
    ? `data:image/jpeg;base64,${result.processed_image}`
    : ''
  const heatmapImageDataUrl = result?.heatmap_image
    ? `data:image/jpeg;base64,${result.heatmap_image}`
    : ''

  const impact = {
    vegetation_loss: result?.environmental_impact?.vegetation_loss ?? 0,
    soil_erosion_risk: result?.environmental_impact?.soil_erosion_risk ?? 0,
    water_pollution_risk: result?.environmental_impact?.water_pollution_risk ?? 0,
    biodiversity_loss: result?.environmental_impact?.biodiversity_loss ?? 0,
  }

  const statusCard = !result || !result.mining_detected
    ? statusCardMap.safe
    : result.risk_level === 'High Risk'
      ? statusCardMap.high
      : result.risk_level === 'Medium Risk'
        ? statusCardMap.medium
        : statusCardMap.safe

  const generatePdfReport = () => {
    if (!result) {
      return
    }

    const report = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    let y = 40

    report.setFont('helvetica', 'bold')
    report.setFontSize(18)
    report.text('Environmental Impact Report', 40, y)
    y += 22

    report.setFont('helvetica', 'normal')
    report.setFontSize(11)
    report.text(`File: ${uploadedFileName || 'Uploaded satellite image'}`, 40, y)
    y += 16
    report.text(`Mining detected: ${result.mining_detected ? 'Yes' : 'No'}`, 40, y)
    y += 16
    report.text(`Risk level: ${result.risk_level}`, 40, y)
    y += 16
    report.text(`Confidence: ${(result.confidence * 100).toFixed(1)}%`, 40, y)
    y += 16
    report.text(`Disturbed area: ${(result.disturbed_ratio * 100).toFixed(2)}%`, 40, y)
    y += 22

    report.setFont('helvetica', 'bold')
    report.text('Environmental Metrics', 40, y)
    y += 16
    report.setFont('helvetica', 'normal')
    report.text(`Vegetation Loss: ${impact.vegetation_loss.toFixed(1)}%`, 40, y)
    y += 14
    report.text(`Soil Erosion Risk: ${impact.soil_erosion_risk.toFixed(1)}%`, 40, y)
    y += 14
    report.text(`Water Contamination Risk: ${impact.water_pollution_risk.toFixed(1)}%`, 40, y)
    y += 14
    report.text(`Biodiversity Loss: ${impact.biodiversity_loss.toFixed(1)}%`, 40, y)
    y += 22

    if (uploadedImageDataUrl) {
      report.setFont('helvetica', 'bold')
      report.text('Uploaded Image', 40, y)
      y += 10
      report.addImage(uploadedImageDataUrl, 'JPEG', 40, y, 240, 150)
    }

    if (processedImageDataUrl) {
      report.setFont('helvetica', 'bold')
      report.text('Processed Detection Image', 310, y - 10)
      report.addImage(processedImageDataUrl, 'JPEG', 310, y, 240, 150)
    }

    report.save('environmental-impact-report.pdf')
  }

  return (
    <section className="rounded-2xl bg-panel/90 p-6 shadow-glow backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-100">Detection Result Panel</h2>
        <button
          type="button"
          onClick={generatePdfReport}
          disabled={!result || loading}
          className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-800 disabled:text-slate-400"
        >
          Generate Environmental Impact Report
        </button>
      </div>

      {loading && (
        <div className="mt-4 animate-pulse rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-slate-300">
          Processing satellite image and detecting disturbed land...
        </div>
      )}

      {!loading && errorMessage && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          {errorMessage}
        </div>
      )}

      {!loading && !result && !errorMessage && (
        <p className="mt-4 rounded-xl border border-slate-700 bg-slate-900/40 p-4 text-slate-300">
          Upload a satellite image to view mining detection insights.
        </p>
      )}

      {!loading && result && (
        <div className="mt-5 space-y-4">
          {result.message && (
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
              {result.message}
            </div>
          )}

          <div className={`rounded-xl border p-4 ${statusCard.cardClass}`}>
            <p className={`text-sm font-semibold ${statusCard.textClass}`}>
              {statusCard.icon} {statusCard.label}
            </p>
          </div>

          {result.mining_detected ? (
            <>
              <div className="grid gap-3 rounded-xl border border-slate-700 bg-slate-900/50 p-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Mining detected</p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">Yes</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Risk level</p>
                  <div className="mt-2">
                    <RiskIndicator riskLevel={result.risk_level} />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Confidence</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-300">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Disturbed Area</p>
                  <p className="mt-1 text-lg font-semibold text-amber-300">
                    {(result.disturbed_ratio * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">Confidence Indicator</p>
                  <span className="text-xs text-cyan-300">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(result.confidence * 100, 100)}%` }}
                  />
                </div>
              </div>

              {result.processed_image && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Processed image with detected mining regions</p>
                  <img
                    src={processedImageDataUrl}
                    alt="Processed satellite analysis"
                    className="max-h-[420px] w-full rounded-xl border border-slate-700 object-contain"
                  />
                </div>
              )}

              {result.heatmap_image && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Mining disturbance heatmap</p>
                  <img
                    src={heatmapImageDataUrl}
                    alt="Mining disturbance heatmap"
                    className="max-h-[420px] w-full rounded-xl border border-slate-700 object-contain"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-100">
              <p className="text-lg font-semibold">✅ No Mining Activity Detected</p>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-emerald-300">Land condition:</span> Stable
                </p>
                <p>
                  <span className="text-emerald-300">Environmental impact:</span> Minimal
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default DetectionResult
