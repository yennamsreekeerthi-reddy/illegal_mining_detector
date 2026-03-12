from dataclasses import dataclass

import cv2
import numpy as np


@dataclass
class LandValidationResult:
    is_land_image: bool
    land_ratio: float


def validate_land_image(image: np.ndarray, minimum_land_ratio: float = 0.15) -> LandValidationResult:
    """Validate whether the uploaded image resembles satellite land imagery.

    The heuristic checks combined vegetation + soil coverage in HSV space.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Vegetation range.
    lower_green = np.array([30, 35, 30])
    upper_green = np.array([90, 255, 255])
    vegetation_mask = cv2.inRange(hsv, lower_green, upper_green)

    # Exposed soil / earth tones.
    lower_soil = np.array([5, 25, 30])
    upper_soil = np.array([35, 255, 255])
    soil_mask = cv2.inRange(hsv, lower_soil, upper_soil)

    land_mask = cv2.bitwise_or(vegetation_mask, soil_mask)

    total_pixels = float(image.shape[0] * image.shape[1])
    land_pixels = float(cv2.countNonZero(land_mask))
    land_ratio = land_pixels / total_pixels if total_pixels > 0 else 0.0

    return LandValidationResult(
        is_land_image=land_ratio >= minimum_land_ratio,
        land_ratio=round(land_ratio, 4),
    )
