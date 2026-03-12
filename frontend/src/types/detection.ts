export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface EnvironmentalImpactMetrics {
  vegetation_loss: number
  soil_erosion_risk: number
  water_pollution_risk: number
  habitat_damage: number
}

export interface DetectionResultData {
  mining_detected: boolean
  risk_level: RiskLevel
  confidence: number
  disturbed_ratio: number
  environmental_impact: EnvironmentalImpactMetrics
  processed_image?: string
}
