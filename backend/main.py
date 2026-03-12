import base64
from typing import Any
import os
import cv2
import numpy as np

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.image_processing.preprocess import preprocess_image
from backend.image_processing.heatmap import build_disturbance_heatmap
from backend.analysis.land_validation import validate_land_image
from backend.model.mining_detector import (
    build_environmental_impact,
    classify_risk,
    detect_mining_regions,
    estimate_severity_score,
)
from backend.utils.metadata import build_analysis_metadata

app = FastAPI(title="Illegal Mining Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "Illegal Mining Detection API"}


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)) -> dict[str, Any]:

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    data = await file.read()
    np_buffer = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Unable to decode image.")

    land_validation = validate_land_image(image)
    if not land_validation.is_land_image:
        metadata = build_analysis_metadata(
            image=image,
            disturbed_ratio=0.0,
            severity_score=0.0,
            land_ratio=land_validation.land_ratio,
        )
        return {
            "mining_detected": False,
            "risk_level": "None",
            "confidence": 0,
            "disturbed_ratio": 0,
            "environmental_impact": {},
            "heatmap_image": None,
            "processed_image": None,
            "metadata": metadata,
            "message": "Image does not appear to be satellite land imagery.",
        }

    preprocessed = preprocess_image(image)

    artifacts = detect_mining_regions(image, preprocessed)
    disturbed_regions = artifacts.region_count
    disturbed_ratio = artifacts.disturbed_ratio
    boxed_image = artifacts.processed_image

    heatmap = build_disturbance_heatmap(image, artifacts.disturbed_mask)

    mining_detected, risk_level, confidence = classify_risk(
        disturbed_ratio, disturbed_regions
    )

    encoded_ok, encoded_buffer = cv2.imencode(".jpg", boxed_image)
    heatmap_encoded_ok, heatmap_encoded_buffer = cv2.imencode(".jpg", heatmap)

    if not encoded_ok or not heatmap_encoded_ok:
        raise HTTPException(status_code=500, detail="Failed to encode analysis images.")

    processed_b64 = base64.b64encode(encoded_buffer.tobytes()).decode("utf-8")
    heatmap_b64 = base64.b64encode(heatmap_encoded_buffer.tobytes()).decode("utf-8")

    environmental_impact = build_environmental_impact(disturbed_ratio)
    severity_score = estimate_severity_score(disturbed_ratio, confidence)
    metadata = build_analysis_metadata(
        image=image,
        disturbed_ratio=disturbed_ratio,
        severity_score=severity_score,
        land_ratio=land_validation.land_ratio,
    )

    return {
        "mining_detected": mining_detected,
        "risk_level": risk_level,
        "confidence": confidence,
        "disturbed_ratio": round(disturbed_ratio, 4),
        "environmental_impact": environmental_impact,
        "heatmap_image": heatmap_b64,
        "processed_image": processed_b64,
        "metadata": metadata,
        "message": "Analysis completed successfully.",
    }


# -----------------------------
# Serve React Frontend
# -----------------------------

frontend_dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")

# Serve static assets (JS/CSS)
assets_path = os.path.join(frontend_dist, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")


@app.get("/")
async def serve_frontend():
    index_file = os.path.join(frontend_dist, "index.html")
    return FileResponse(index_file)


@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_file = os.path.join(frontend_dist, "index.html")
    return FileResponse(index_file)