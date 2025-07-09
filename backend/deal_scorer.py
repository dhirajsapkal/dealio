"""
Deal Scoring Algorithm for Guitar Listings
Implements the 100-point scoring system to evaluate deal quality.
"""

import re
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from models import GuitarListing, MarketPrice
from sqlalchemy.orm import Session

# Configure logging
logger = logging.getLogger(__name__)

# Red flag keywords for listing quality analysis
NEGATIVE_KEYWORDS = [
    "broken", "for parts", "damaged", "cracked", "issue", "repair", 
    "needs work", "not working", "defective", "scratched", "dented",
    "project", "restore", "restoration", "missing parts", "as is"
]

# Positive keywords that indicate good condition/listing
POSITIVE_KEYWORDS = [
    "mint condition", "original case", "recently serviced", "professional setup",
    "perfect condition", "like new", "barely used", "well maintained",
    "original packaging", "warranty", "certified", "authenticated"
]


def calculate_deal_score(listing: GuitarListing, avg_market_price: float) -> Tuple[int, Dict]:
    """
    Calculate deal score for a guitar listing based on the specified algorithm.
    
    Args:
        listing: GuitarListing object with all listing details
        avg_market_price: Average market price for this guitar model
    
    Returns:
        Tuple of (total_score, breakdown_dict)
        - total_score: Integer from 0-100
        - breakdown_dict: Detailed scoring breakdown for transparency
    
    Scoring Breakdown:
        - Price Analysis: 50 points maximum
        - Seller Credibility: 25 points maximum  
        - Listing Quality: 25 points maximum
    """
    
    logger.info(f"Calculating deal score for listing {listing.listing_id} (${listing.price})")
    
    score = 0
    breakdown = {
        'price_score': 0,
        'seller_score': 0, 
        'listing_score': 0,
        'price_analysis': {},
        'seller_analysis': {},
        'listing_analysis': {}
    }
    
    # 1. PRICE ANALYSIS (50 points maximum)
    price_score, price_analysis = _score_price(listing.price, avg_market_price)
    score += price_score
    breakdown['price_score'] = price_score
    breakdown['price_analysis'] = price_analysis
    
    # 2. SELLER CREDIBILITY (25 points maximum)
    seller_score, seller_analysis = _score_seller(listing)
    score += seller_score
    breakdown['seller_score'] = seller_score
    breakdown['seller_analysis'] = seller_analysis
    
    # 3. LISTING QUALITY (25 points maximum)
    listing_score, listing_analysis = _score_listing_quality(listing)
    score += listing_score
    breakdown['listing_score'] = listing_score
    breakdown['listing_analysis'] = listing_analysis
    
    # Ensure score doesn't exceed 100
    total_score = min(score, 100)
    
    logger.info(f"Deal score calculated: {total_score}/100 (Price: {price_score}, Seller: {seller_score}, Listing: {listing_score})")
    
    return total_score, breakdown


def _score_price(price: float, avg_market_price: float) -> Tuple[int, Dict]:
    """
    Score the price component (50 points maximum).
    
    Scoring logic:
    - 75%+ below market: 50 points (Excellent deal)
    - 10-25% below market: 35 points (Good deal)
    - At market price: 20 points (Fair deal)
    - Above market: 5 points (Poor deal)
    """
    
    if avg_market_price <= 0:
        logger.warning("Invalid average market price, using price score of 10")
        return 10, {'error': 'No market data available'}
    
    price_ratio = price / avg_market_price
    percentage_below_market = (1 - price_ratio) * 100
    
    analysis = {
        'price_ratio': round(price_ratio, 3),
        'percentage_below_market': round(percentage_below_market, 1),
        'avg_market_price': avg_market_price,
        'listing_price': price
    }
    
    if price_ratio <= 0.75:  # 25%+ below market
        score = 50
        analysis['category'] = 'Excellent deal'
    elif price_ratio <= 0.90:  # 10-25% below market
        score = 35
        analysis['category'] = 'Good deal'
    elif price_ratio <= 1.0:  # At or slightly below market
        score = 20
        analysis['category'] = 'Fair deal'
    else:  # Above market price
        score = 5
        analysis['category'] = 'Overpriced'
    
    logger.debug(f"Price score: {score}/50 ({analysis['category']}, {percentage_below_market:.1f}% below market)")
    
    return score, analysis


def _score_seller(listing: GuitarListing) -> Tuple[int, Dict]:
    """
    Score seller credibility (25 points maximum).
    
    Scoring logic:
    - Verified seller: 25 points
    - Account age > 30 days: 15 points
    - New account: 5 points
    """
    
    analysis = {
        'verified': listing.seller_verified,
        'account_age_days': listing.seller_account_age_days,
        'rating': listing.seller_rating,
        'total_sales': listing.seller_total_sales,
        'red_flags': []
    }
    
    # Base scoring
    if listing.seller_verified:
        score = 25
        analysis['category'] = 'Verified seller'
    elif listing.seller_account_age_days > 30:
        score = 15
        analysis['category'] = 'Established account'
    else:
        score = 5
        analysis['category'] = 'New account'
        analysis['red_flags'].append('Very new seller account')
    
    # Additional factors that can affect score
    if listing.seller_rating and listing.seller_rating < 3.0:
        score = max(score - 10, 0)  # Reduce score for poor ratings
        analysis['red_flags'].append(f'Low seller rating: {listing.seller_rating}/5')
    
    if listing.seller_total_sales and listing.seller_total_sales < 5:
        score = max(score - 5, 0)  # Slight reduction for very few sales
        analysis['red_flags'].append('Very few completed sales')
    
    logger.debug(f"Seller score: {score}/25 ({analysis['category']})")
    
    return score, analysis


def _score_listing_quality(listing: GuitarListing) -> Tuple[int, Dict]:
    """
    Score listing quality and detect red flags (25 points maximum).
    
    Scoring logic:
    - Red flags detected OR <= 1 image: 5 points
    - Good description (>150 chars) AND 3+ images: 25 points  
    - Moderate quality: 15 points
    """
    
    description = listing.description or ""
    image_urls = listing.image_urls or []
    image_count = len(image_urls)
    
    analysis = {
        'description_length': len(description),
        'image_count': image_count,
        'negative_keywords_found': [],
        'positive_keywords_found': [],
        'red_flags': [],
        'quality_indicators': []
    }
    
    # Check for negative keywords in description
    desc_lower = description.lower()
    negative_found = [keyword for keyword in NEGATIVE_KEYWORDS if keyword in desc_lower]
    positive_found = [keyword for keyword in POSITIVE_KEYWORDS if keyword in desc_lower]
    
    analysis['negative_keywords_found'] = negative_found
    analysis['positive_keywords_found'] = positive_found
    
    # Detect major red flags
    has_red_flags = len(negative_found) > 0
    
    if has_red_flags:
        analysis['red_flags'].extend([f"Warning keyword: '{kw}'" for kw in negative_found])
    
    if image_count <= 1:
        analysis['red_flags'].append("Very few images provided")
    
    # Score based on quality assessment
    if has_red_flags or image_count <= 1:
        score = 5
        analysis['category'] = 'Poor quality listing'
    elif len(description) > 150 and image_count >= 3:
        score = 25
        analysis['category'] = 'High quality listing'
        analysis['quality_indicators'].append("Detailed description")
        analysis['quality_indicators'].append(f"{image_count} images provided")
    else:
        score = 15
        analysis['category'] = 'Moderate quality listing'
    
    # Bonus points for positive indicators
    if len(positive_found) > 0:
        bonus = min(len(positive_found) * 2, 5)  # Max 5 bonus points
        score = min(score + bonus, 25)
        analysis['quality_indicators'].extend([f"Positive: '{kw}'" for kw in positive_found])
    
    logger.debug(f"Listing quality score: {score}/25 ({analysis['category']})")
    
    return score, analysis


def calculate_market_price(db: Session, brand: str, model: str, guitar_type: str) -> Optional[float]:
    """
    Calculate average market price for a guitar model from recent listings.
    
    Args:
        db: Database session
        brand: Guitar brand (e.g., "Fender")
        model: Guitar model (e.g., "Stratocaster")  
        guitar_type: Guitar type (e.g., "Electric")
    
    Returns:
        Average price as float, or None if insufficient data
    """
    
    try:
        # First check if we have cached market price data
        cached_price = db.query(MarketPrice).filter(
            MarketPrice.brand == brand,
            MarketPrice.model == model,
            MarketPrice.type == guitar_type,
            MarketPrice.calculated_at > datetime.utcnow() - timedelta(days=7)  # Max 7 days old
        ).first()
        
        if cached_price:
            logger.info(f"Using cached market price for {brand} {model}: ${cached_price.avg_price}")
            return cached_price.avg_price
        
        # Calculate from recent listings (last 90 days)
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        recent_listings = db.query(GuitarListing).filter(
            GuitarListing.brand == brand,
            GuitarListing.model == model,
            GuitarListing.type == guitar_type,
            GuitarListing.scraped_at > cutoff_date,
            GuitarListing.price > 0,  # Valid prices only
            GuitarListing.is_active == True
        ).all()
        
        if len(recent_listings) < 5:  # Need at least 5 listings for reliable average
            logger.warning(f"Insufficient data for {brand} {model} market price (only {len(recent_listings)} listings)")
            return None
        
        # Calculate statistics
        prices = [listing.price for listing in recent_listings]
        prices.sort()
        
        # Remove outliers (bottom 10% and top 10%)
        outlier_cutoff = max(1, len(prices) // 10)
        filtered_prices = prices[outlier_cutoff:-outlier_cutoff] if len(prices) > 10 else prices
        
        avg_price = sum(filtered_prices) / len(filtered_prices)
        min_price = min(prices)
        max_price = max(prices)
        median_price = prices[len(prices) // 2]
        
        # Cache the calculated price
        market_price = MarketPrice(
            brand=brand,
            model=model,
            type=guitar_type,
            avg_price=avg_price,
            min_price=min_price,
            max_price=max_price,
            median_price=median_price,
            sample_size=len(recent_listings),
            calculated_at=datetime.utcnow()
        )
        
        db.add(market_price)
        db.commit()
        
        logger.info(f"Calculated market price for {brand} {model}: ${avg_price:.2f} (n={len(recent_listings)})")
        return avg_price
        
    except Exception as e:
        logger.error(f"Error calculating market price for {brand} {model}: {e}")
        return None


def score_all_listings_for_guitar(db: Session, brand: str, model: str, guitar_type: str) -> List[Dict]:
    """
    Score all active listings for a specific guitar model.
    
    Args:
        db: Database session
        brand: Guitar brand
        model: Guitar model
        guitar_type: Guitar type
    
    Returns:
        List of dictionaries with listing data and scores
    """
    
    # Get market price
    avg_market_price = calculate_market_price(db, brand, model, guitar_type)
    
    if not avg_market_price:
        logger.warning(f"No market price available for {brand} {model}, using default scoring")
        avg_market_price = 1000.0  # Default fallback
    
    # Get all active listings
    listings = db.query(GuitarListing).filter(
        GuitarListing.brand == brand,
        GuitarListing.model == model,
        GuitarListing.type == guitar_type,
        GuitarListing.is_active == True
    ).all()
    
    scored_listings = []
    
    for listing in listings:
        try:
            score, breakdown = calculate_deal_score(listing, avg_market_price)
            
            # Update listing with calculated score
            listing.deal_score = score
            listing.avg_market_price = avg_market_price
            listing.price_below_market_pct = ((avg_market_price - listing.price) / avg_market_price) * 100
            
            scored_listings.append({
                'listing': listing.to_dict(),
                'deal_score': score,
                'score_breakdown': breakdown
            })
            
        except Exception as e:
            logger.error(f"Error scoring listing {listing.listing_id}: {e}")
            continue
    
    # Commit score updates
    try:
        db.commit()
    except Exception as e:
        logger.error(f"Error saving deal scores: {e}")
        db.rollback()
    
    # Sort by deal score (highest first)
    scored_listings.sort(key=lambda x: x['deal_score'], reverse=True)
    
    logger.info(f"Scored {len(scored_listings)} listings for {brand} {model}")
    return scored_listings 