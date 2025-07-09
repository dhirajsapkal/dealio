"""
FastAPI Router for Guitar-related Endpoints
Handles guitar listing retrieval, deal scoring, and tracking functionality.
"""

import logging
from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import GuitarListing, TrackedGuitar, MarketPrice
from deal_scorer import calculate_deal_score, score_all_listings_for_guitar, calculate_market_price
from scrapers import SCRAPERS, SCRAPER_PRIORITY

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/guitars", tags=["guitars"])


@router.get("/")
async def get_all_guitars(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    source: Optional[str] = Query(None, description="Filter by marketplace source"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    guitar_type: Optional[str] = Query(None, description="Filter by guitar type (Electric, Acoustic, Bass)")
):
    """
    Get all guitar listings with optional filtering.
    
    Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - source: Filter by marketplace (Reverb, Facebook, eBay, etc.)
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    - guitar_type: Filter by guitar type
    """
    
    try:
        # Build query with filters
        query = db.query(GuitarListing).filter(GuitarListing.is_active == True)
        
        if source:
            query = query.filter(GuitarListing.source == source)
        
        if min_price is not None:
            query = query.filter(GuitarListing.price >= min_price)
        
        if max_price is not None:
            query = query.filter(GuitarListing.price <= max_price)
        
        if guitar_type:
            query = query.filter(GuitarListing.type == guitar_type)
        
        # Execute query with pagination
        listings = query.offset(skip).limit(limit).all()
        
        # Convert to dictionaries
        results = [listing.to_dict() for listing in listings]
        
        logger.info(f"Retrieved {len(results)} guitar listings")
        
        return {
            "listings": results,
            "count": len(results),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"Error retrieving guitar listings: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving guitar listings")


@router.get("/{brand}/{model}")
async def get_guitars_by_model(
    brand: str,
    model: str,
    db: Session = Depends(get_db),
    guitar_type: Optional[str] = Query(None, description="Filter by guitar type"),
    include_inactive: bool = Query(False, description="Include inactive listings")
):
    """
    Get all listings for a specific guitar brand and model.
    
    Path parameters:
    - brand: Guitar brand (e.g., "Fender")
    - model: Guitar model (e.g., "Stratocaster")
    
    Query parameters:
    - guitar_type: Filter by guitar type (Electric, Acoustic, Bass)
    - include_inactive: Include expired/inactive listings
    """
    
    try:
        # Build query
        query = db.query(GuitarListing).filter(
            GuitarListing.brand.ilike(f"%{brand}%"),
            GuitarListing.model.ilike(f"%{model}%")
        )
        
        if not include_inactive:
            query = query.filter(GuitarListing.is_active == True)
        
        if guitar_type:
            query = query.filter(GuitarListing.type == guitar_type)
        
        # Order by deal score (highest first), then by price (lowest first)
        listings = query.order_by(
            GuitarListing.deal_score.desc().nullslast(),
            GuitarListing.price.asc()
        ).all()
        
        if not listings:
            raise HTTPException(
                status_code=404,
                detail=f"No listings found for {brand} {model}"
            )
        
        # Convert to dictionaries
        results = [listing.to_dict() for listing in listings]
        
        # Calculate market price if not already cached
        market_price = calculate_market_price(db, brand, model, guitar_type or "Electric")
        
        logger.info(f"Retrieved {len(results)} listings for {brand} {model}")
        
        return {
            "brand": brand,
            "model": model,
            "guitar_type": guitar_type,
            "market_price": market_price,
            "listings": results,
            "count": len(results)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving listings for {brand} {model}: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving guitar listings")


@router.get("/{brand}/{model}/dealscore")
async def get_deal_scores(
    brand: str,
    model: str,
    db: Session = Depends(get_db),
    guitar_type: str = Query("Electric", description="Guitar type for deal scoring")
):
    """
    Get deal scores for all listings of a specific guitar model.
    
    This endpoint calculates and returns deal scores for all active listings
    of the specified guitar brand and model, sorted by deal score.
    
    Path parameters:
    - brand: Guitar brand (e.g., "Fender")
    - model: Guitar model (e.g., "Stratocaster")
    
    Query parameters:
    - guitar_type: Guitar type for market price calculation (default: Electric)
    """
    
    try:
        # Score all listings for this guitar
        scored_listings = score_all_listings_for_guitar(db, brand, model, guitar_type)
        
        if not scored_listings:
            raise HTTPException(
                status_code=404,
                detail=f"No listings found for {brand} {model} {guitar_type}"
            )
        
        # Calculate summary statistics
        scores = [item['deal_score'] for item in scored_listings]
        best_score = max(scores) if scores else 0
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Get market price
        market_price = calculate_market_price(db, brand, model, guitar_type)
        
        logger.info(f"Calculated deal scores for {len(scored_listings)} {brand} {model} listings")
        
        return {
            "brand": brand,
            "model": model,
            "guitar_type": guitar_type,
            "market_price": market_price,
            "summary": {
                "total_listings": len(scored_listings),
                "best_score": best_score,
                "average_score": round(avg_score, 1)
            },
            "listings": scored_listings
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating deal scores for {brand} {model}: {e}")
        raise HTTPException(status_code=500, detail="Error calculating deal scores")


@router.get("/tracked")
async def get_tracked_guitars(db: Session = Depends(get_db)):
    """
    Get all user-tracked guitars.
    
    Returns a list of guitars that the user has added to their tracking list.
    """
    
    try:
        tracked_guitars = db.query(TrackedGuitar).filter(
            TrackedGuitar.is_active == True
        ).all()
        
        results = [guitar.to_dict() for guitar in tracked_guitars]
        
        logger.info(f"Retrieved {len(results)} tracked guitars")
        
        return {
            "tracked_guitars": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error retrieving tracked guitars: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving tracked guitars")


@router.post("/tracked")
async def add_tracked_guitar(
    guitar_data: dict,
    db: Session = Depends(get_db)
):
    """
    Add a new guitar to the tracking list.
    
    Request body should contain:
    - brand: Guitar brand (required)
    - model: Guitar model (required)
    - type: Guitar type (required: Electric, Acoustic, Bass)
    - max_price: Maximum price alert threshold (optional)
    - min_condition: Minimum acceptable condition (optional)
    """
    
    try:
        # Validate required fields
        required_fields = ['brand', 'model', 'type']
        for field in required_fields:
            if field not in guitar_data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required field: {field}"
                )
        
        # Check if guitar is already tracked
        existing = db.query(TrackedGuitar).filter(
            TrackedGuitar.brand == guitar_data['brand'],
            TrackedGuitar.model == guitar_data['model'],
            TrackedGuitar.type == guitar_data['type'],
            TrackedGuitar.is_active == True
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail="This guitar is already being tracked"
            )
        
        # Create new tracked guitar
        tracked_guitar = TrackedGuitar(
            brand=guitar_data['brand'],
            model=guitar_data['model'],
            type=guitar_data['type'],
            max_price=guitar_data.get('max_price'),
            min_condition=guitar_data.get('min_condition')
        )
        
        db.add(tracked_guitar)
        db.commit()
        db.refresh(tracked_guitar)
        
        logger.info(f"Added tracked guitar: {guitar_data['brand']} {guitar_data['model']}")
        
        return {
            "message": "Guitar added to tracking list",
            "tracked_guitar": tracked_guitar.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding tracked guitar: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error adding tracked guitar")


@router.delete("/tracked/{guitar_id}")
async def remove_tracked_guitar(
    guitar_id: int,
    db: Session = Depends(get_db)
):
    """
    Remove a guitar from the tracking list.
    
    Path parameters:
    - guitar_id: ID of the tracked guitar to remove
    """
    
    try:
        tracked_guitar = db.query(TrackedGuitar).filter(
            TrackedGuitar.id == guitar_id,
            TrackedGuitar.is_active == True
        ).first()
        
        if not tracked_guitar:
            raise HTTPException(
                status_code=404,
                detail="Tracked guitar not found"
            )
        
        # Soft delete by setting is_active to False
        tracked_guitar.is_active = False
        db.commit()
        
        logger.info(f"Removed tracked guitar: {tracked_guitar.brand} {tracked_guitar.model}")
        
        return {"message": "Guitar removed from tracking list"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing tracked guitar {guitar_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error removing tracked guitar")


@router.get("/market-prices")
async def get_market_prices(
    db: Session = Depends(get_db),
    brand: Optional[str] = Query(None),
    model: Optional[str] = Query(None)
):
    """
    Get market price data for guitar models.
    
    Query parameters:
    - brand: Filter by guitar brand (optional)
    - model: Filter by guitar model (optional)
    """
    
    try:
        query = db.query(MarketPrice)
        
        if brand:
            query = query.filter(MarketPrice.brand.ilike(f"%{brand}%"))
        
        if model:
            query = query.filter(MarketPrice.model.ilike(f"%{model}%"))
        
        market_prices = query.order_by(MarketPrice.calculated_at.desc()).all()
        
        results = [price.to_dict() for price in market_prices]
        
        logger.info(f"Retrieved {len(results)} market price records")
        
        return {
            "market_prices": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error retrieving market prices: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving market prices")


@router.get("/sources")
async def get_available_sources():
    """
    Get list of available marketplace sources.
    
    Returns information about all configured scrapers and their priority.
    """
    
    return {
        "sources": SCRAPER_PRIORITY,
        "scraper_info": {
            source: {
                "name": source.title(),
                "priority": idx + 1,
                "available": source in SCRAPERS
            }
            for idx, source in enumerate(SCRAPER_PRIORITY)
        }
    }


@router.get("/best-deals")
async def get_best_deals(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    min_score: int = Query(70, ge=0, le=100)
):
    """
    Get the best deals across all guitar listings.
    
    Query parameters:
    - limit: Maximum number of deals to return
    - min_score: Minimum deal score threshold
    """
    
    try:
        # Get listings with high deal scores
        best_deals = db.query(GuitarListing).filter(
            GuitarListing.is_active == True,
            GuitarListing.deal_score >= min_score
        ).order_by(
            GuitarListing.deal_score.desc(),
            GuitarListing.price.asc()
        ).limit(limit).all()
        
        results = [listing.to_dict() for listing in best_deals]
        
        logger.info(f"Retrieved {len(results)} best deals (score >= {min_score})")
        
        return {
            "best_deals": results,
            "count": len(results),
            "min_score": min_score
        }
        
    except Exception as e:
        logger.error(f"Error retrieving best deals: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving best deals") 