"""
Guitar Center Listings Scraper
Medium priority marketplace.
"""

import logging
from datetime import datetime
from typing import List, Dict

logger = logging.getLogger(__name__)

def scrape_guitar_center(query: str, max_results: int = 20) -> List[Dict]:
    """Scrape Guitar Center for guitar listings."""
    logger.info(f"Starting Guitar Center scrape for query: '{query}'")
    
    demo_listings = [
        {
            'listing_id': 'gc_demo_1',
            'source': 'Guitar Center',
            'brand': 'PRS',
            'model': 'Custom 24',
            'type': 'Electric',
            'price': 2100.0,
            'seller_name': 'Guitar Center',
            'seller_location': 'Store Location',
            'seller_verified': True,
            'seller_rating': 4.5,
            'seller_account_age_days': 3650,
            'url': "https://guitarcenter.com/item/demo1",
            'listed_date': None,
            'condition': 'New',
            'description': 'PRS Custom 24 electric guitar, brand new condition.',
            'image_urls': [],
            'scraped_at': datetime.utcnow()
        }
    ]
    
    return demo_listings[:max_results] 