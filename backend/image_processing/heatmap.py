import cv2
import numpy as np


def build_disturbance_heatmap(original_image: np.ndarray, disturbance_mask: np.ndarray) -> np.ndarray:
    """Create a disturbance heatmap overlay from binary disturbance mask."""
    normalized = cv2.normalize(disturbance_mask, None, 0, 255, cv2.NORM_MINMAX)
    colorized = cv2.applyColorMap(normalized, cv2.COLORMAP_JET)
    blended = cv2.addWeighted(original_image, 0.7, colorized, 0.3, 0)
    return blended
