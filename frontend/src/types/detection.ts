export type RiskLevel = 'None' | 'No Mining' | 'Low Risk' | 'Medium Risk' | 'High Risk'

export interface EnvironmentalImpactMetrics {
  vegetation_loss: number
  soil_erosion_risk: number
  water_pollution_risk: number
  biodiversity_loss: number
}

export interface AnalysisMetadata {
  disturbed_land_area_percentage: number
  estimated_mining_severity_score: number
  image_resolution: string
  analysis_timestamp: string
  land_coverage_ratio: number
}

export interface DetectionResultData {
  mining_detected: boolean
  risk_level: RiskLevel
  confidence: number
  disturbed_ratio: number
  environmental_impact?: Partial<EnvironmentalImpactMetrics>
  heatmap_image?: string | null
  processed_image?: string
  metadata?: AnalysisMetadata
  message?: string
}
