"""
Dealio - Guitar Deal Tracker API (Minimal Version)
Minimal FastAPI application for testing basic functionality.
"""

import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict

# Import the guitar database
from guitar_database import (
    get_all_brands,
    get_models_for_brand,
    get_guitar_info
)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(
    title="Dealio - Guitar Deal Tracker API (Minimal)",
    description="Minimal version for testing basic functionality",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Dealio Guitar Deal Tracker API (Minimal)!",
        "status": "minimal_mode"
    }

@app.get("/health")
async def health_check():
    return JSONResponse(content={
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "minimal",
        "mode": "basic_functionality_only"
    })

@app.get("/guitars/brands", response_model=List[str])
async def get_guitar_brands():
    logger.info("🎸 Brands endpoint called")
    brands = get_all_brands()
    logger.info(f"🎸 Found {len(brands)} brands: {brands[:5]}...")
    if not brands:
        raise HTTPException(status_code=404, detail="No guitar brands found.")
    return brands

@app.get("/guitars/models", response_model=List[str])
async def get_guitar_models(brand: str):
    logger.info(f"🎸 Models endpoint called with brand: '{brand}'")
    models = get_models_for_brand(brand)
    logger.info(f"🎸 Found {len(models) if models else 0} models for brand '{brand}': {models[:5] if models else 'None'}")
    if not models:
        logger.warning(f"🎸 No models found for brand '{brand}' - returning 404")
        raise HTTPException(status_code=404, detail=f"No models found for brand '{brand}' or brand does not exist.")
    logger.info(f"🎸 Returning {len(models)} models for brand '{brand}'")
    return models

@app.get("/guitars/{brand}/{model}")
async def search_for_guitar_deals(brand: str, model: str):
    logger.info(f"🎸 Deal search called for: {brand} {model}")
    
    # Get basic info from database
    model_info = get_guitar_info(brand, model)
    
    # Return minimal response without API calls
    response = {
        "query": {"brand": brand, "model": model},
        "guitarData": {
            "brand": brand,
            "model": model,
            "info": model_info,
            "specs": None,
            "imageUrl": "/placeholder.jpg"
        },
        "marketData": {
            "priceRange": {"min": 0, "max": 0},
            "averagePrice": 0,
            "listingCount": 0
        },
        "deals": {
            "all": [],
            "categorized": {},
            "sources": []
        },
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "data_sources": [],
            "has_real_data": False,
            "mode": "minimal"
        }
    }
    
    return response 