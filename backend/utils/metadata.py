from datetime import datetime, timezone

import numpy as np


def build_analysis_metadata(
    image: np.ndarray,
    disturbed_ratio: float,
    severity_score: float,
    land_ratio: float,
) -> dict[str, str | float]:
    height, width = image.shape[:2]
    return {
        "disturbed_land_area_percentage": round(disturbed_ratio * 100, 2),
        "estimated_mining_severity_score": round(severity_score, 2),
        "image_resolution": f"{width}x{height}",
        "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
        "land_coverage_ratio": round(land_ratio, 4),
    }
