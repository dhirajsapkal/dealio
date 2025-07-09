"""
Sweetwater Listings Scraper
Medium priority marketplace.
"""

import logging
from datetime import datetime
from typing import List, Dict

logger = logging.getLogger(__name__)

def scrape_sweetwater(query: str, max_results: int = 20) -> List[Dict]:
    """Scrape Sweetwater for guitar listings."""
    logger.info(f"Starting Sweetwater scrape for query: '{query}'")
    
    demo_listings = [
        {
            'listing_id': 'sw_demo_1',
            'source': 'Sweetwater',
            'brand': 'Taylor',
            'model': '814ce',
            'type': 'Acoustic',
            'price': 3200.0,
            'seller_name': 'Sweetwater',
            'seller_location': 'Fort Wayne, IN',
            'seller_verified': True,
            'seller_rating': 4.9,
            'seller_account_age_days': 7300,
            'url': "https://sweetwater.com/item/demo1",
            'listed_date': None,
            'condition': 'New',
            'description': 'Taylor 814ce acoustic guitar with electronics.',
            'image_urls': [],
            'scraped_at': datetime.utcnow()
        }
    ]
    
    return demo_listings[:max_results] 