"""
eBay Guitar Listings Scraper
High priority marketplace with API support.
"""

import logging
from datetime import datetime
from typing import List, Dict

logger = logging.getLogger(__name__)

def scrape_ebay(query: str, max_results: int = 30) -> List[Dict]:
    """Scrape eBay for guitar listings."""
    logger.info(f"Starting eBay scrape for query: '{query}'")
    
    demo_listings = [
        {
            'listing_id': 'ebay_demo_1',
            'source': 'eBay',
            'brand': 'Gibson',
            'model': 'SG',
            'type': 'Electric',
            'price': 1100.0,
            'seller_name': 'eBay Seller',
            'seller_location': 'Los Angeles, CA',
            'seller_verified': True,
            'seller_rating': 4.8,
            'seller_account_age_days': 365,
            'url': "https://ebay.com/item/demo1",
            'listed_date': None,
            'condition': 'Excellent',
            'description': 'Gibson SG electric guitar in excellent condition.',
            'image_urls': [],
            'scraped_at': datetime.utcnow()
        }
    ]
    
    return demo_listings[:max_results] 