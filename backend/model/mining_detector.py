from dataclasses import dataclass
from typing import Literal

import cv2
import numpy as np

RiskLevel = Literal["No Mining", "Low Risk", "Medium Risk", "High Risk"]


@dataclass
class DetectionArtifacts:
    region_count: int
    disturbed_ratio: float
    disturbed_mask: np.ndarray
    processed_image: np.ndarray


def build_environmental_impact(disturbed_ratio: float) -> dict[str, float]:
    """Estimate environmental impact metrics from disturbed land ratio.

    Values are returned as percentage-like scores in the range [0, 100].
    """
    severity = max(0.0, min(disturbed_ratio / 0.3, 1.0))

    vegetation_loss = min(100.0, 10 + severity * 90)
    soil_erosion_risk = min(100.0, 8 + severity * 86)
    water_pollution_risk = min(100.0, 5 + severity * 70)
    biodiversity_loss = min(100.0, 9 + severity * 82)

    return {
        "vegetation_loss": round(vegetation_loss, 2),
        "soil_erosion_risk": round(soil_erosion_risk, 2),
        "water_pollution_risk": round(water_pollution_risk, 2),
        "biodiversity_loss": round(biodiversity_loss, 2),
    }


def detect_mining_regions(original_image: np.ndarray, processed_mask: np.ndarray) -> DetectionArtifacts:
    """Find likely mining disturbance contours and draw targeted bounding boxes.

    Environmental filtering logic:
    - Vegetation/crop texture can create many small edge fragments -> ignore small contours.
    - Farmland tends to have more uniform, regular parcel-like patterns.
    - Mining scars are often irregular and expose bare soil.
    - Draw boxes only for sufficiently large, bare-soil dominant disturbed regions.
    """
    # Additional smoothing + opening before contour extraction for robust detections.
    smoothed = cv2.GaussianBlur(processed_mask, (5, 5), 0)
    _, binary = cv2.threshold(smoothed, 30, 255, cv2.THRESH_BINARY)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    refined_mask = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=2)

    contours, _ = cv2.findContours(refined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    output = original_image.copy()
    image_area = float(original_image.shape[0] * original_image.shape[1])
    hsv_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2HSV)

    # Bare soil profile for exposed terrain commonly seen in open-pit disturbances.
    lower_soil = np.array([5, 30, 40])
    upper_soil = np.array([35, 255, 255])
    soil_pixels_global = cv2.inRange(hsv_image, lower_soil, upper_soil)

    disturbed_pixels = 0.0
    disturbed_regions = 0

    disturbance_mask = np.zeros(processed_mask.shape, dtype=np.uint8)

    for contour in contours:
        contour_area = cv2.contourArea(contour)

        # Reject tiny noisy structures from forest canopy textures.
        if contour_area < 700:
            continue

        x, y, w, h = cv2.boundingRect(contour)
        if w * h < 900:
            continue

        perimeter = cv2.arcLength(contour, True)
        if perimeter <= 0:
            continue

        # Irregular-shape indicator: lower circularity => less likely to be natural tree blobs.
        circularity = (4 * np.pi * contour_area) / (perimeter * perimeter)

        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        solidity = contour_area / hull_area if hull_area > 0 else 0.0

        contour_mask = np.zeros(processed_mask.shape, dtype=np.uint8)
        cv2.drawContours(contour_mask, [contour], -1, 255, thickness=-1)
        region_pixels = float(cv2.countNonZero(contour_mask))
        if region_pixels == 0:
            continue

        # Bare-soil dominance check to separate disturbance from vegetation/farmland remnants.
        soil_in_contour = cv2.bitwise_and(soil_pixels_global, contour_mask)
        soil_ratio = cv2.countNonZero(soil_in_contour) / region_pixels

        # Keep contours that are either clearly irregular or fractured, and soil-rich.
        if soil_ratio < 0.25:
            continue
        if circularity > 0.75 and solidity > 0.9:
            continue

        disturbed_regions += 1
        disturbed_pixels += contour_area
        cv2.drawContours(disturbance_mask, [contour], -1, 255, thickness=-1)

        # Draw boxes only for larger likely open-pit areas (avoid small residual clusters).
        if contour_area >= 1200 and soil_ratio >= 0.35:
            cv2.rectangle(output, (x, y), (x + w, y + h), (0, 0, 255), 2)

    disturbed_ratio = disturbed_pixels / image_area if image_area > 0 else 0.0

    return DetectionArtifacts(
        region_count=disturbed_regions,
        disturbed_ratio=disturbed_ratio,
        disturbed_mask=disturbance_mask,
        processed_image=output,
    )


def classify_risk(disturbed_ratio: float, region_count: int) -> tuple[bool, RiskLevel, float]:
    """Classify risk based on disturbed area and number of active regions."""
    if disturbed_ratio < 0.05:
        return False, "No Mining", round(min(0.98, 0.85 + (0.05 - disturbed_ratio) * 1.8), 2)

    mining_detected = True

    if disturbed_ratio < 0.15:
        risk = "Low Risk"
        confidence = min(0.9, 0.62 + disturbed_ratio * 1.8 + region_count * 0.012)
    elif disturbed_ratio < 0.30:
        risk = "Medium Risk"
        confidence = min(0.95, 0.7 + disturbed_ratio * 1.1 + region_count * 0.01)
    else:
        risk = "High Risk"
        confidence = min(0.99, 0.82 + disturbed_ratio * 0.7 + region_count * 0.008)

    return mining_detected, risk, round(confidence, 2)


def estimate_severity_score(disturbed_ratio: float, confidence: float) -> float:
    """Compute a 0-100 severity score for dashboard display."""
    disturbed_component = min(100.0, disturbed_ratio * 100 * 2.4)
    confidence_component = max(0.0, min(100.0, confidence * 100))
    score = 0.75 * disturbed_component + 0.25 * confidence_component
    return round(min(100.0, score), 2)
