import cv2
import numpy as np


def preprocess_image(image: np.ndarray) -> np.ndarray:
    """Preprocess image for mining disturbance extraction.

    Environmental logic used here:
    - Vegetation (healthy forest canopy): mostly green hues in HSV, removed from analysis.
    - Farmland / crop cover: yellow-green bands are also excluded to avoid false positives.
    - Bare soil / exposed earth: brown-yellow bands are retained as candidate disturbance.
    - Possible mining disturbance: exposed/bare soil with clear edges in non-vegetated regions.
    """
    blurred = cv2.GaussianBlur(image, (5, 5), 0)
    hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

    # 1) Vegetation mask (forest canopy): remove dense green regions from disturbance analysis.
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    vegetation_mask = cv2.inRange(hsv, lower_green, upper_green)

    # 2) Farmland/crop mask (yellow-green): often textured but not mining disturbance.
    lower_farmland = np.array([20, 35, 35])
    upper_farmland = np.array([40, 255, 255])
    farmland_mask = cv2.inRange(hsv, lower_farmland, upper_farmland)

    non_vegetation_mask = cv2.bitwise_not(cv2.bitwise_or(vegetation_mask, farmland_mask))

    # 3) Bare soil mask: captures exposed soil where open-pit activity may appear.
    lower_soil = np.array([5, 30, 40])
    upper_soil = np.array([35, 255, 255])
    soil_mask = cv2.inRange(hsv, lower_soil, upper_soil)
    soil_mask = cv2.bitwise_and(soil_mask, non_vegetation_mask)

    gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 45, 130)
    edges = cv2.bitwise_and(edges, non_vegetation_mask)

    # 4) Disturbance evidence = exposed soil + edges, only outside vegetation/farmland.
    combined = cv2.bitwise_or(soil_mask, edges)

    # Robust cleanup for noisy satellite textures.
    open_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))

    cleaned = cv2.morphologyEx(combined, cv2.MORPH_OPEN, open_kernel, iterations=2)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, close_kernel, iterations=2)

    # Smooth mask before contour extraction in downstream detector.
    cleaned = cv2.GaussianBlur(cleaned, (5, 5), 0)
    _, cleaned = cv2.threshold(cleaned, 35, 255, cv2.THRESH_BINARY)

    return cleaned
