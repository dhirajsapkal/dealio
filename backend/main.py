"""
Dealio - Guitar Deal Tracker API
Main FastAPI application file.

This file defines the core API for the Dealio application. It handles:
- Real-time aggregation of guitar deals from multiple online marketplaces.
- Serving standardized guitar data to the frontend.
- Providing endpoints for searching, tracking, and analyzing guitar listings.

Architecture Overview:
- FastAPI: The web framework used for building the API.
- Modular Components:
  - `guitar_database.py`: Contains a comprehensive, static database of guitar brands, models, and specifications.
  - `guitar_specs_api.py`: Provides detailed guitar specifications and images from external APIs (like Unsplash).
  - `reverb_api.py`: Integrates with the Reverb marketplace API to fetch real-time listings.
- Asynchronous Operations: Uses `asyncio` and `ThreadPoolExecutor` to handle long-running tasks like API calls without blocking the server.
- CORS Middleware: Configured to allow requests from the Vercel-hosted frontend.
"""

import logging
import aiohttp
import asyncio
import os
import json
import random
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
import concurrent.futures
from bs4 import BeautifulSoup

# --- Modular Imports ---
# These imports bring in the core functionalities of the application from separate, organized modules.

# Import the comprehensive guitar database
# This module provides a foundational dataset of guitar information, including brands, models, types, and price ranges.
from guitar_database import (
    get_all_brands, 
    get_models_for_brand, 
    search_guitars, 
    get_guitar_info,
    get_guitars_by_type,
    get_guitars_by_price_range,
    GUITAR_DATABASE
)

# --- Logging Configuration ---
# Set up logging first to ensure all subsequent operations are logged.
# This helps in debugging and monitoring the application's behavior.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Optional API Integrations ---
# The application is designed to work even if some external API integrations fail.
# This section safely imports optional modules and logs their availability.

# Import guitar specs API for fetching detailed specifications and images.
try:
    from guitar_specs_api import get_guitar_specs_sync
    GUITAR_SPECS_AVAILABLE = True
    logger.info("Successfully imported guitar_specs_api. Detailed specs and images are available.")
except ImportError as e:
    GUITAR_SPECS_AVAILABLE = False
    logger.warning(f"Could not import guitar_specs_api: {e}. Detailed specs and images will be unavailable.")

# Import Reverb API for fetching real-time marketplace data.
try:
    # We use a synchronous wrapper (`search_reverb_guitars_sync`) to call the async Reverb API
    # from within FastAPI's synchronous-by-default endpoint functions. This is crucial
    # to avoid "event loop already running" errors.
    from reverb_api import search_reverb_guitars_sync
    REVERB_API_AVAILABLE = True
    logger.info("Successfully imported reverb_api. Real-time Reverb listings are available.")
except ImportError as e:
    REVERB_API_AVAILABLE = False
    logger.warning(f"Could not import reverb_api: {e}. Real-time Reverb listings will be unavailable.")


# --- FastAPI App Initialization ---
# This section creates the FastAPI application instance and configures global settings.

app = FastAPI(
    title="Dealio - Guitar Deal Tracker API",
    description="A real-time API for aggregating and analyzing guitar deals from various online marketplaces. This service provides endpoints to search for guitars, fetch live listings, and get detailed specifications.",
    version="2.0.0",
    docs_url="/docs",  # Enables Swagger UI documentation at /docs
    redoc_url="/redoc" # Enables ReDoc documentation at /redoc
)

# --- CORS (Cross-Origin Resource Sharing) Configuration ---
# This middleware is essential for allowing the frontend application (hosted on a different domain like Vercel)
# to communicate with this backend API. It specifies which origins, methods, and headers are permitted.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",  # Allows any Vercel deployment, including previews and production.
        "*"  # In a real production environment, this should be restricted to the specific frontend URL.
    ],
    allow_credentials=True, # Allows cookies and authentication headers to be sent.
    allow_methods=["*"],    # Allows all standard HTTP methods (GET, POST, etc.).
    allow_headers=["*"],    # Allows all request headers.
)

# --- Constants and Mock Data ---
# This section defines constants and data structures used throughout the application.

# Defines the marketplaces the system is designed to integrate with.
# Currently, only "Reverb" is actively used for real data.
SUPPORTED_MARKETPLACES = ["Reverb", "Facebook", "eBay", "Craigslist", "Guitar Center", "Sweetwater"]


# --- Core Helper Functions ---
# These functions perform key data processing tasks required by the API endpoints.

def standardize_listing(listing: Dict, source: str) -> Dict:
    """
    Normalizes a raw listing from a marketplace into a standardized format.

    This function ensures that data from different sources (like Reverb) is consistent,
    making it easier for the frontend to process and display. It extracts key information
    like price, condition, and seller details, and handles missing data gracefully.
    
    Args:
        listing (Dict): The raw listing data from a source API (e.g., Reverb).
        source (str): The name of the marketplace (e.g., "Reverb").
    
    Returns:
        Dict: A dictionary containing the standardized listing data.
    """
    # Safely extract and clean the price.
    price = listing.get('price', 0)
    if isinstance(price, str):
        try:
            # Remove currency symbols and commas before converting to float.
            price = float(price.replace('$', '').replace(',', ''))
        except (ValueError, TypeError):
            price = 0.0

    # Clean the description to remove HTML tags
    raw_description = listing.get('description', '')
    cleaned_description = BeautifulSoup(raw_description, 'html.parser').get_text(separator=' ', strip=True)

    # Build the standardized dictionary with default fallbacks for missing fields.
    standardized = {
        "id": f"{source.lower()}_{listing.get('id', hash(json.dumps(listing, sort_keys=True)))}",
        "title": listing.get('title', 'N/A'),
        "brand": listing.get('make', 'N/A'),
        "model": listing.get('model', 'N/A'),
        "price": round(price, 2),
        "condition": listing.get('condition', {}).get('display_name', 'N/A') if isinstance(listing.get('condition'), dict) else listing.get('condition', 'N/A'),
        "year": listing.get('year', 'N/A'),
        "location": listing.get('location', {}).get('display_location', 'N/A') if isinstance(listing.get('location'), dict) else 'N/A',
        "finish": listing.get('finish', 'N/A'),
        "category": listing.get('category', 'N/A'),
        "description": cleaned_description,
        "listingUrl": listing.get('web_url', '#'),
        "imageUrl": listing.get('photos', [{}])[0].get('_links', {}).get('large_crop', {}).get('href', '/placeholder.jpg'),
        "source": source,
        "created_at": listing.get('created_at', datetime.now().isoformat()),
        "has_real_data": True # Flag indicating this is real marketplace data.
    }
    return standardized


def categorize_deals(listings: List[Dict], brand: str, model: str) -> Dict:
    """
    Analyzes and categorizes a list of deals into meaningful groups.

    This function takes a list of standardized listings and sorts them into categories
    like "Best Value," "Cheapest," "Highest Quality," and "Most Recent." This helps users
    quickly identify the most interesting deals.
    
    Args:
        listings (List[Dict]): A list of standardized listing dictionaries.
        brand (str): The guitar brand being searched.
        model (str): The guitar model being searched.
    
    Returns:
        Dict: A dictionary containing categorized lists of deals. Returns an empty dict if no listings are provided.
    """
    if not listings:
        return {}

    # Sort listings by price (ascending)
    cheapest_deals = sorted(listings, key=lambda x: x['price'])

    # Sort listings by creation date (descending)
    most_recent_deals = sorted(listings, key=lambda x: x['created_at'], reverse=True)

    # Placeholder for value and quality analysis. In a real system, these would
    # involve more complex logic, comparing price against condition, year, etc.
    best_value_deals = sorted(listings, key=lambda x: x['price']) # Simple value metric for now
    highest_quality_deals = sorted(listings, key=lambda x: (x.get('condition', 'Z'), -x.get('price', 0))) # Prioritize better condition, then price

    return {
        "best_value": best_value_deals,
        "cheapest": cheapest_deals,
        "highest_quality": highest_quality_deals,
        "most_recent": most_recent_deals
    }


# --- API Endpoints ---
# This section defines all the public-facing API routes for the application.

@app.get("/")
async def root():
    """
    Root endpoint for the API.

    Provides a welcome message and a link to the API documentation.
    Useful for simple health checks or discovering the API.
    """
    return {
        "message": "Welcome to the Dealio Guitar Deal Tracker API!",
        "documentation_url": "/docs",
        "health_check_url": "/health"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns the operational status of the API and its key dependencies.
    Essential for monitoring and uptime checks in a production environment.
    """
    return JSONResponse(content={
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": app.version,
        "dependencies": {
            "reverb_api_available": REVERB_API_AVAILABLE,
            "guitar_specs_api_available": GUITAR_SPECS_AVAILABLE,
        }
    })

@app.get("/status")
async def get_system_status():
    """
    Provides a more detailed status of the system, including API availability.

    This can be used by the frontend to dynamically adjust its UI based on which
    backend services are currently active (e.g., disable features if an API is down).
    """
    return {
        "reverb_api_available": REVERB_API_AVAILABLE,
        "guitar_specs_api_available": GUITAR_SPECS_AVAILABLE,
        "supported_marketplaces": SUPPORTED_MARKETPLACES,
        "database_status": "operational" # Assumed operational as it's a local file.
    }

# --- Guitar Information Endpoints ---

@app.get("/guitars", summary="Get All Guitars", response_model=List[Dict])
async def get_all_guitars():
    """
    Retrieves a list of all guitars from the internal database.

    This endpoint is useful for providing a comprehensive overview of all known
    guitar models, for example, in a searchable directory.
    """
    # `get_all_brands()` returns a list of brand names. We need to fetch models for each.
    all_guitars = []
    brands = get_all_brands()
    for brand in brands:
        models = get_models_for_brand(brand)
        for model in models:
            all_guitars.append({"brand": brand, "model": model})
    return all_guitars


@app.get("/guitars/brands", summary="Get All Guitar Brands", response_model=List[str])
async def get_guitar_brands():
    """
    Retrieves a list of all unique guitar brands from the database.
    Perfect for populating dropdowns or search filters on the frontend.
    """
    brands = get_all_brands()
    if not brands:
        raise HTTPException(status_code=404, detail="No guitar brands found.")
    return brands

@app.get("/guitars/models", summary="Get Models for a Brand", response_model=List[str])
async def get_guitar_models(brand: str):
    """
    Retrieves all available models for a given guitar brand.

    Args:
        brand (str): The brand to fetch models for (e.g., "Gibson").

    Raises:
        HTTPException: 404 if the brand is not found or has no models.
    """
    logger.info(f"🎸 Models endpoint called with brand: '{brand}'")
    models_data = get_models_for_brand(brand)
    logger.info(f"🎸 Raw models data: {models_data[:3] if models_data else 'None'}")
    
    # Extract just the model names from the dictionaries
    model_names = [model['name'] for model in models_data] if models_data else []
    
    logger.info(f"🎸 Found {len(model_names)} models for brand '{brand}': {model_names[:5] if model_names else 'None'}")
    if not model_names:
        logger.warning(f"🎸 No models found for brand '{brand}' - returning 404")
        raise HTTPException(status_code=404, detail=f"No models found for brand '{brand}' or brand does not exist.")
    logger.info(f"🎸 Returning {len(model_names)} models for brand '{brand}'")
    return model_names

# --- Core Deal Search Endpoint ---

@app.get("/guitars/{brand}/{model}", summary="Search for Guitar Deals")
async def search_for_guitar_deals(brand: str, model: str):
    """
    The main endpoint for fetching real-time deals for a specific guitar model.

    This function orchestrates the entire process:
    1. Fetches basic guitar information from the internal database.
    2. Calls the Reverb API to get live marketplace listings.
    3. Fetches detailed specs and an image from the Guitar Specs API.
    4. Standardizes and categorizes the listings.
    5. Compiles everything into a single, comprehensive response for the frontend.

    Args:
        brand (str): The guitar brand (e.g., "Gibson").
        model (str): The guitar model (e.g., "Les Paul").

    Returns:
        A structured dictionary containing all guitar data, specs, and categorized deals.
    """
    logger.info(f"Received deal search request for: {brand} {model}")

    # Step 1: Get basic info from our internal database.
    model_info = get_guitar_info(brand, model)
    if not model_info:
        logger.warning(f"No internal data found for {brand} {model}.")
        # We can proceed without it, but the response will be less detailed.

    # Step 2: Fetch real-time listings from Reverb API.
    # The `search_reverb_guitars_sync` function runs the async search in a separate
    # thread, preventing it from blocking the FastAPI event loop.
    listings = []
    if REVERB_API_AVAILABLE:
        try:
            logger.info(f"Calling Reverb API for '{brand} {model}'...")
            raw_listings = search_reverb_guitars_sync(brand, model)
            if raw_listings:
                # Standardize the listings to our application's format.
                listings = [standardize_listing(l, "Reverb") for l in raw_listings]
                logger.info(f"Successfully fetched and standardized {len(listings)} listings from Reverb.")
            else:
                logger.warning(f"Reverb API returned no listings for '{brand} {model}'.")
        except Exception as e:
            logger.error(f"An error occurred while calling Reverb API: {e}", exc_info=True)
            # Do not re-raise; allow the API to return with what it has.
    else:
        logger.warning("Reverb API is not available. Cannot fetch real-time listings.")

    # Step 3: Fetch detailed guitar specs and an image.
    guitar_specs = None
    if GUITAR_SPECS_AVAILABLE:
        try:
            logger.info(f"Calling Guitar Specs API for '{brand} {model}'...")
            guitar_specs = get_guitar_specs_sync(brand, model)
            if guitar_specs:
                logger.info("Successfully fetched guitar specs.")
            else:
                logger.warning("Guitar Specs API returned no data.")
        except Exception as e:
            logger.error(f"An error occurred while calling Guitar Specs API: {e}", exc_info=True)

    # Step 4: Categorize the fetched deals.
    categorized_deals = categorize_deals(listings, brand, model)

    # Step 5: Compile the final response payload.
    # This structure is designed to be easily consumed by the frontend.
    final_response = {
        "query": {"brand": brand, "model": model},
        "guitarData": {
            "brand": brand,
            "model": model,
            "info": model_info,
            "specs": guitar_specs, # Will be None if API failed
            "imageUrl": guitar_specs.get("imageUrl") if guitar_specs else "/placeholder.jpg"
        },
        "marketData": {
            "priceRange": {
                "min": min(l['price'] for l in listings) if listings else 0,
                "max": max(l['price'] for l in listings) if listings else 0
            },
            "averagePrice": round(sum(l['price'] for l in listings) / len(listings), 2) if listings else 0,
            "listingCount": len(listings)
        },
        "deals": {
            "all": listings,
            "categorized": categorized_deals,
            "sources": list(set(l['source'] for l in listings))
        },
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "data_sources": ["Reverb"] if listings else [],
            "has_real_data": bool(listings)
        }
    }

    return final_response 