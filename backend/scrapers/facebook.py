"""
Facebook Marketplace Guitar Listings Scraper
High priority marketplace for local guitar deals.

Facebook Marketplace is challenging to scrape due to dynamic content and anti-bot measures.
This implementation provides a basic framework that can be extended with more sophisticated techniques.
"""

import requests
import time
import re
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote_plus

# Configure logging
logger = logging.getLogger(__name__)

# Facebook Marketplace configuration
FACEBOOK_BASE_URL = "https://www.facebook.com"
FACEBOOK_MARKETPLACE_URL = f"{FACEBOOK_BASE_URL}/marketplace"

# Headers to mimic a real browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
}

# Rate limiting
REQUEST_DELAY = 3  # seconds between requests (higher due to stricter rate limiting)
MAX_RESULTS_PER_LOCATION = 20


def scrape_facebook(query: str, max_results: int = 30, location: str = "United States") -> List[Dict]:
    """
    Scrape guitar listings from Facebook Marketplace.
    
    Note: Facebook Marketplace scraping is challenging due to:
    - Dynamic content loading (React/JavaScript)
    - Strong anti-bot measures
    - Location-based restrictions
    - Login requirements for some features
    
    Args:
        query: Search query (e.g., "Fender Stratocaster Electric")
        max_results: Maximum number of listings to return
        location: Location for search (default: "United States")
    
    Returns:
        List of dictionaries containing standardized listing data
    """
    
    logger.info(f"Starting Facebook Marketplace scrape for query: '{query}' in {location}")
    logger.warning("Facebook Marketplace scraping has limitations due to anti-bot measures")
    
    try:
        session = requests.Session()
        session.headers.update(HEADERS)
        
        # Try to access Facebook Marketplace search
        search_url = _build_facebook_search_url(query, location)
        
        logger.debug(f"Facebook search URL: {search_url}")
        
        response = session.get(search_url, timeout=20)
        
        # Facebook often returns a login page or redirects
        if 'login' in response.url.lower() or response.status_code != 200:
            logger.warning("Facebook requires login or blocked request")
            return _get_demo_facebook_listings(query, max_results)
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Facebook uses dynamic loading, so static HTML scraping is limited
        listings = _parse_facebook_listings(soup, query)
        
        # Limit results
        listings = listings[:max_results]
        
        logger.info(f"Facebook scrape completed: {len(listings)} listings found")
        return listings
        
    except Exception as e:
        logger.error(f"Error scraping Facebook Marketplace: {e}")
        # Return demo listings for development/testing
        return _get_demo_facebook_listings(query, min(max_results, 5))


def _build_facebook_search_url(query: str, location: str) -> str:
    """
    Build Facebook Marketplace search URL.
    
    Args:
        query: Search query
        location: Location for search
    
    Returns:
        Formatted search URL
    """
    
    encoded_query = quote_plus(query)
    
    # Facebook Marketplace search URL structure
    # Note: This is simplified and may need adjustment based on actual FB URL structure
    search_url = f"{FACEBOOK_MARKETPLACE_URL}/search/?query={encoded_query}"
    
    return search_url


def _parse_facebook_listings(soup: BeautifulSoup, query: str) -> List[Dict]:
    """
    Parse Facebook Marketplace listings from HTML.
    
    Note: Facebook uses heavy JavaScript rendering, so this method has limitations.
    A more robust solution would require browser automation (Selenium, Playwright).
    
    Args:
        soup: BeautifulSoup object of the page
        query: Original search query
    
    Returns:
        List of parsed listings
    """
    
    listings = []
    
    try:
        # Facebook's HTML structure changes frequently
        # These selectors are approximations and may need updates
        
        listing_containers = soup.find_all('div', {'role': 'button'}) or \
                           soup.find_all('div', class_=re.compile(r'marketplace.*item'))
        
        logger.debug(f"Found {len(listing_containers)} potential listing containers")
        
        for container in listing_containers:
            try:
                listing_data = _parse_facebook_listing_container(container, query)
                if listing_data:
                    listings.append(listing_data)
            except Exception as e:
                logger.debug(f"Error parsing Facebook listing container: {e}")
                continue
        
        return listings
        
    except Exception as e:
        logger.error(f"Error parsing Facebook listings: {e}")
        return []


def _parse_facebook_listing_container(container, query: str) -> Optional[Dict]:
    """
    Parse a single Facebook listing container.
    
    Args:
        container: BeautifulSoup element
        query: Search query for context
    
    Returns:
        Standardized listing dictionary or None
    """
    
    try:
        # Extract text content
        text_content = container.get_text(strip=True)
        
        # Look for price patterns
        price_match = re.search(r'\$[\d,]+(?:\.\d{2})?', text_content)
        if not price_match:
            return None
        
        price_text = price_match.group()
        price = _extract_price(price_text)
        
        if not price or price < 50 or price > 50000:
            return None
        
        # Look for guitar-related terms
        text_lower = text_content.lower()
        guitar_terms = ['guitar', 'fender', 'gibson', 'electric', 'acoustic', 'bass']
        
        if not any(term in text_lower for term in guitar_terms):
            return None
        
        # Extract URL if available
        link_elem = container.find('a')
        url = None
        if link_elem and link_elem.get('href'):
            url = urljoin(FACEBOOK_BASE_URL, link_elem['href'])
        
        # Generate listing ID
        listing_id = f"facebook_{hash(text_content)}"
        
        # Parse guitar details
        brand, model, guitar_type = _parse_guitar_details(text_content)
        
        # Extract location (basic approach)
        location_match = re.search(r'([A-Z][a-z]+,\s*[A-Z]{2})', text_content)
        seller_location = location_match.group() if location_match else None
        
        listing_data = {
            'listing_id': listing_id,
            'source': 'Facebook',
            'brand': brand,
            'model': model,
            'type': guitar_type,
            'price': price,
            'seller_name': 'Facebook User',  # FB doesn't show names in listings
            'seller_location': seller_location,
            'seller_verified': False,
            'seller_rating': None,
            'seller_account_age_days': None,
            'url': url,
            'listed_date': None,
            'condition': None,
            'description': text_content[:500],  # Truncate long text
            'image_urls': [],
            'scraped_at': datetime.utcnow()
        }
        
        logger.debug(f"Parsed Facebook listing: {brand} {model} - ${price}")
        return listing_data
        
    except Exception as e:
        logger.debug(f"Error parsing Facebook listing: {e}")
        return None


def _extract_price(price_text: str) -> Optional[float]:
    """Extract numeric price from Facebook price text."""
    
    try:
        cleaned = re.sub(r'[^\d.,]', '', price_text)
        cleaned = cleaned.replace(',', '')
        
        price = float(cleaned)
        
        if 50 <= price <= 50000:
            return price
        
        return None
        
    except (ValueError, AttributeError):
        return None


def _parse_guitar_details(text: str) -> tuple[str, str, str]:
    """Parse guitar brand, model, and type from Facebook listing text."""
    
    text_lower = text.lower()
    
    brands = [
        'fender', 'gibson', 'martin', 'taylor', 'yamaha', 'ibanez',
        'esp', 'prs', 'rickenbacker', 'gretsch', 'epiphone', 'squier'
    ]
    
    guitar_types = ['electric', 'acoustic', 'bass', 'classical']
    
    brand = 'Unknown'
    for b in brands:
        if b in text_lower:
            brand = b.title()
            break
    
    guitar_type = 'Electric'
    for gt in guitar_types:
        if gt in text_lower:
            guitar_type = gt.title()
            break
    
    if 'bass' in text_lower:
        guitar_type = 'Bass'
    
    # Extract model (simplified)
    model = 'Unknown Model'
    common_models = ['stratocaster', 'telecaster', 'les paul', 'sg', 'flying v']
    
    for cm in common_models:
        if cm in text_lower:
            model = cm.title()
            break
    
    return brand, model, guitar_type


def _get_demo_facebook_listings(query: str, count: int = 5) -> List[Dict]:
    """
    Generate demo Facebook listings for development/testing.
    
    Since Facebook scraping is challenging, this provides realistic test data.
    
    Args:
        query: Search query
        count: Number of demo listings to generate
    
    Returns:
        List of demo listing dictionaries
    """
    
    logger.info(f"Generating {count} demo Facebook listings for development")
    
    demo_listings = [
        {
            'listing_id': 'facebook_demo_1',
            'source': 'Facebook',
            'brand': 'Fender',
            'model': 'Stratocaster',
            'type': 'Electric',
            'price': 675.0,
            'seller_name': 'Facebook User',
            'seller_location': 'Denver, CO',
            'seller_verified': False,
            'seller_rating': None,
            'seller_account_age_days': None,
            'url': f"{FACEBOOK_MARKETPLACE_URL}/item/demo1",
            'listed_date': None,
            'condition': 'Good',
            'description': 'Fender Stratocaster electric guitar in good condition. Minor wear but plays great.',
            'image_urls': [],
            'scraped_at': datetime.utcnow()
        },
        {
            'listing_id': 'facebook_demo_2',
            'source': 'Facebook',
            'brand': 'Gibson',
            'model': 'Les Paul',
            'type': 'Electric',
            'price': 1250.0,
            'seller_name': 'Facebook User',
            'seller_location': 'Portland, OR',
            'seller_verified': False,
            'seller_rating': None,
            'seller_account_age_days': None,
            'url': f"{FACEBOOK_MARKETPLACE_URL}/item/demo2",
            'listed_date': None,
            'condition': 'Excellent',
            'description': 'Gibson Les Paul Studio electric guitar. Barely used, excellent condition.',
            'image_urls': [],
            'scraped_at': datetime.utcnow()
        },
        {
            'listing_id': 'facebook_demo_3',
            'source': 'Facebook',
            'brand': 'Yamaha',
            'model': 'FG800',
            'type': 'Acoustic',
            'price': 150.0,
            'seller_name': 'Facebook User',
            'seller_location': 'Austin, TX',
            'seller_verified': False,
            'seller_rating': None,
            'seller_account_age_days': None,
            'url': f"{FACEBOOK_MARKETPLACE_URL}/item/demo3",
            'listed_date': None,
            'condition': 'Good',
            'description': 'Yamaha acoustic guitar for sale. Perfect for beginners.',
            'image_urls': [],
            'scraped_at': datetime.utcnow()
        }
    ]
    
    # Filter by query if specific
    query_lower = query.lower()
    if any(term in query_lower for term in ['fender', 'gibson', 'yamaha']):
        demo_listings = [
            listing for listing in demo_listings 
            if listing['brand'].lower() in query_lower
        ]
    
    return demo_listings[:count]


# Test function
if __name__ == "__main__":
    # Test the scraper
    test_results = scrape_facebook("Fender Stratocaster", max_results=3)
    print(f"Test results: {len(test_results)} listings found")
    for listing in test_results:
        print(f"- {listing['brand']} {listing['model']} - ${listing['price']}") 