#!/usr/bin/env python3
"""
Reverb API Integration - Real Guitar Marketplace Data
"""

import aiohttp
import asyncio
import os
from typing import Dict, List, Optional
from datetime import datetime
import json
import logging

# Configuration
REVERB_ACCESS_TOKEN = os.getenv("REVERB_ACCESS_TOKEN", "b3d5326753d592a76778cf23f7df94e67a8c8e651c4b92b75e8452c3611c2b43")
REVERB_API_BASE = "https://api.reverb.com/api"

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ReverbAPI:
    def __init__(self):
        self.base_url = REVERB_API_BASE
        self.headers = {
            "Authorization": f"Bearer {REVERB_ACCESS_TOKEN}",
            "Accept": "application/hal+json",
            "Content-Type": "application/hal+json",
            "Accept-Version": "3.0"
        }
        self.cache = {}
    
    async def search_guitars(self, brand: str, model: str, max_results: int = 20) -> List[Dict]:
        """Search for guitar listings on Reverb"""
        
        cache_key = f"{brand}_{model}_{max_results}"
        if cache_key in self.cache:
            logger.info(f"Using cached results for {brand} {model}")
            return self.cache[cache_key]
        
        try:
            query = f"{brand} {model}".strip()
            logger.info(f"Searching Reverb for: {query}")
            
            async with aiohttp.ClientSession() as session:
                params = {
                    "query": query,
                    "per_page": min(max_results, 50),  # Reverb API limit
                    "item_type": "electric-guitars,acoustic-guitars,bass-guitars",
                    "state": "live"  # Only live listings
                }
                
                url = f"{self.base_url}/listings"
                async with session.get(url, headers=self.headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        listings = self._parse_listings(data.get("listings", []))
                        
                        # Cache results for 5 minutes
                        self.cache[cache_key] = listings
                        logger.info(f"Found {len(listings)} listings for {brand} {model}")
                        return listings
                    else:
                        logger.error(f"Reverb API error: {response.status}")
                        return []
                        
        except Exception as e:
            logger.error(f"Error searching Reverb API: {e}")
            return []
    
    def _parse_listings(self, raw_listings: List[Dict]) -> List[Dict]:
        """Parse Reverb API listings into our standard format"""
        
        parsed_listings = []
        
        logger.info(f"Parsing {len(raw_listings)} raw listings")
        logger.info(f"First raw listing type: {type(raw_listings[0]) if raw_listings else 'No listings'}")
        
        for i, listing in enumerate(raw_listings):
            try:
                if not isinstance(listing, dict):
                    logger.warning(f"Listing {i} is not a dict: {type(listing)} = {str(listing)[:100]}")
                    continue
                # Extract price
                price_data = listing.get("price", {})
                if isinstance(price_data, dict):
                    price = float(price_data.get("amount", 0))
                else:
                    logger.warning(f"Price data is not a dict: {type(price_data)} = {price_data}")
                    price = 0
                
                # Extract photos
                photos = listing.get("photos", [])
                image_url = ""
                if photos and isinstance(photos, list) and len(photos) > 0:
                    first_photo = photos[0]
                    if isinstance(first_photo, dict):
                        links = first_photo.get("_links", {})
                        if isinstance(links, dict):
                            crop = links.get("large_crop", {})
                            if isinstance(crop, dict):
                                image_url = crop.get("href", "")
                
                # Extract shipping info
                shipping = listing.get("shipping", {})
                shipping_cost = 0
                if isinstance(shipping, dict):
                    shipping_amount = shipping.get("amount", 0)
                    if shipping_amount:
                        try:
                            shipping_cost = float(shipping_amount)
                        except (ValueError, TypeError):
                            shipping_cost = 0
                
                # Calculate deal score based on various factors
                deal_score = self._calculate_deal_score(listing)
                
                # Parse listing details
                parsed_listing = {
                    "listing_id": str(listing.get("id", "")),
                    "brand": self._extract_brand(listing),
                    "model": self._extract_model(listing),
                    "specific_model": listing.get("title", ""),
                    "price": price,
                    "shipping_cost": shipping_cost,
                    "total_price": price + shipping_cost,
                    "condition": listing.get("condition", {}).get("display_name", "Unknown"),
                    "year": listing.get("year"),
                    "source": "Reverb",
                    "url": listing.get("_links", {}).get("web", {}).get("href", ""),
                    "seller_location": self._extract_location(listing),
                    "listed_date": listing.get("created_at", ""),
                    "seller_name": self._extract_seller_name(listing),
                    "seller_verified": self._is_seller_verified(listing),
                    "seller_rating": self._extract_seller_rating(listing),
                    "deal_score": deal_score,
                    "description": listing.get("description", "")[:200],
                    "image_url": image_url,
                    "listing_photos": len(photos),
                    "marketplace_specific": {
                        "reverb_id": listing.get("id"),
                        "has_video": listing.get("has_video", False),
                        "categories": listing.get("categories", []),
                        "handmade": listing.get("handmade", False),
                        "watchers": listing.get("watchers_count", 0),
                        "make": listing.get("make", ""),
                        "finish": listing.get("finish", ""),
                        "offers_enabled": listing.get("offers_enabled", False)
                    }
                }
                
                parsed_listings.append(parsed_listing)
                
            except Exception as e:
                logger.warning(f"Error parsing listing {i}: {e}")
                logger.warning(f"Listing data: {type(listing)} = {str(listing)[:200]}")
                import traceback
                traceback.print_exc()
                continue
        
        return parsed_listings
    
    def _extract_brand(self, listing: Dict) -> str:
        """Extract brand from listing"""
        make = listing.get("make", "")
        if make and isinstance(make, str):
            return make
        
        # Fallback to title parsing
        title = listing.get("title", "").lower()
        common_brands = ["fender", "gibson", "martin", "taylor", "ibanez", "esp", "jackson", "schecter", "prs"]
        for brand in common_brands:
            if brand in title:
                return brand.title()
        
        return "Unknown"
    
    def _extract_model(self, listing: Dict) -> str:
        """Extract model from listing"""
        model = listing.get("model", "")
        if model and isinstance(model, str):
            # Model field often contains full description, extract key parts
            words = model.split()
            if len(words) > 2:
                return " ".join(words[:3])  # Take first 3 words
            return model
        
        # Fallback to title parsing
        title = listing.get("title", "")
        words = title.split()
        if len(words) > 1:
            return " ".join(words[1:3])  # Take next 1-2 words after brand
        
        return "Unknown"
    
    def _extract_location(self, listing: Dict) -> str:
        """Extract seller location"""
        shop = listing.get("shop", {})
        if shop and isinstance(shop, dict):
            # Try shop name first for location clues
            shop_name = shop.get("name", "")
            if shop_name:
                # Many shops include city in name
                return shop_name
                
            location = shop.get("location", {})
            if location and isinstance(location, dict):
                city = location.get("locality", "")
                region = location.get("region", "")
                if city and region:
                    return f"{city}, {region}"
                elif city:
                    return city
                elif region:
                    return region
        
        return "United States"  # Most Reverb sellers are US-based
    
    def _extract_seller_name(self, listing: Dict) -> str:
        """Extract seller name"""
        shop = listing.get("shop", {})
        if shop:
            return shop.get("name", "Unknown Seller")
        return "Unknown Seller"
    
    def _is_seller_verified(self, listing: Dict) -> bool:
        """Check if seller is verified"""
        shop = listing.get("shop", {})
        if shop:
            return shop.get("preferred_seller", False)
        return False
    
    def _extract_seller_rating(self, listing: Dict) -> float:
        """Extract seller rating"""
        shop = listing.get("shop", {})
        if shop:
            # Check if feedback data is available
            feedback = shop.get("feedback", {})
            if feedback and isinstance(feedback, dict):
                return float(feedback.get("average_rating", 0))
            # Some shops might have rating directly
            rating = shop.get("rating", 0)
            if rating:
                return float(rating)
        return 4.5  # Default good rating for verified sellers
    
    def _calculate_deal_score(self, listing: Dict) -> int:
        """Calculate deal score for a listing (0-100)"""
        score = 50  # Base score
        
        try:
            # Price factor (lower price = higher score potential)
            price = float(listing.get("price", {}).get("amount", 1000))
            if price < 500:
                score += 15
            elif price < 1000:
                score += 10
            elif price < 2000:
                score += 5
            
            # Condition factor
            condition = listing.get("condition", {}).get("slug", "")
            condition_scores = {
                "mint": 20,
                "excellent": 15,
                "very-good": 10,
                "good": 5,
                "fair": 0,
                "poor": -5
            }
            score += condition_scores.get(condition, 0)
            
            # Seller verification
            shop = listing.get("shop", {})
            if shop:
                if shop.get("preferred_seller", False):
                    score += 10
                
                feedback = shop.get("feedback", {})
                if feedback:
                    rating = float(feedback.get("average_rating", 0))
                    if rating >= 4.8:
                        score += 8
                    elif rating >= 4.5:
                        score += 5
                    elif rating >= 4.0:
                        score += 2
            
            # Photo quality
            photos = listing.get("photos", [])
            if len(photos) >= 5:
                score += 5
            elif len(photos) >= 3:
                score += 3
            
            # Watchers (popularity indicator)
            watchers = listing.get("watchers_count", 0)
            if watchers > 10:
                score += 5
            elif watchers > 5:
                score += 2
            
            # Free shipping
            shipping = listing.get("shipping", {})
            if shipping and float(shipping.get("amount", 999)) == 0:
                score += 8
            
            return max(0, min(100, score))
            
        except Exception:
            return 50
    
    async def get_listing_details(self, listing_id: str) -> Optional[Dict]:
        """Get detailed information for a specific listing"""
        
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/listings/{listing_id}"
                async with session.get(url, headers=self.headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        logger.error(f"Error fetching listing details: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"Error getting listing details: {e}")
            return None

# Convenience functions for integration
async def search_reverb_guitars(brand: str, model: str, max_results: int = 20) -> List[Dict]:
    """Search for guitars on Reverb - main function for integration"""
    api = ReverbAPI()
    return await api.search_guitars(brand, model, max_results)

def search_reverb_guitars_sync(brand: str, model: str, max_results: int = 20) -> List[Dict]:
    """Synchronous wrapper for compatibility"""
    try:
        # Check if there's already an event loop running
        try:
            loop = asyncio.get_running_loop()
            # Event loop is running, can't use run_until_complete
            logger.warning("Event loop already running, skipping Reverb search for now")
            return []
        except RuntimeError:
            # No event loop running, safe to create one
            return asyncio.run(search_reverb_guitars(brand, model, max_results))
    except Exception as e:
        logger.error(f"Error in sync Reverb search: {e}")
        return []

if __name__ == "__main__":
    # Test the API
    async def test_reverb_api():
        api = ReverbAPI()
        
        test_searches = [
            ("Gibson", "Les Paul"),
            ("Fender", "Stratocaster"),
            ("Martin", "D-28"),
            ("Taylor", "814ce")
        ]
        
        for brand, model in test_searches:
            print(f"\n🔍 Searching: {brand} {model}")
            listings = await api.search_guitars(brand, model, 5)
            
            if listings:
                print(f"✅ Found {len(listings)} listings")
                for listing in listings[:2]:  # Show first 2
                    print(f"   • ${listing['price']:,} - {listing['condition']} - {listing['seller_location']}")
                    print(f"     Score: {listing['deal_score']}/100 - {listing['specific_model'][:50]}...")
            else:
                print("❌ No listings found")
    
    asyncio.run(test_reverb_api()) 