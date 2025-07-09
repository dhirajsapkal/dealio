"""
Reverb.com Guitar Listings Scraper
High priority marketplace for guitar deals.

Reverb.com is the largest online marketplace for musical instruments.
This scraper handles both web scraping and potential API integration.
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

# Reverb scraping configuration
REVERB_BASE_URL = "https://reverb.com"
REVERB_SEARCH_URL = f"{REVERB_BASE_URL}/marketplace"

# Headers to mimic a real browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

# Rate limiting
REQUEST_DELAY = 2  # seconds between requests
MAX_PAGES = 5  # maximum pages to scrape per search


def scrape_reverb(query: str, max_results: int = 50) -> List[Dict]:
    """
    Scrape guitar listings from Reverb.com.
    
    Args:
        query: Search query (e.g., "Fender Stratocaster Electric")
        max_results: Maximum number of listings to return
    
    Returns:
        List of dictionaries containing standardized listing data
    """
    
    logger.info(f"Starting Reverb scrape for query: '{query}'")
    
    try:
        session = requests.Session()
        session.headers.update(HEADERS)
        
        listings = []
        page = 1
        
        while len(listings) < max_results and page <= MAX_PAGES:
            page_listings = _scrape_reverb_page(session, query, page)
            
            if not page_listings:
                logger.info(f"No more listings found on page {page}, stopping")
                break
            
            listings.extend(page_listings)
            page += 1
            
            # Rate limiting
            if page <= MAX_PAGES:
                time.sleep(REQUEST_DELAY)
        
        # Trim to max_results
        listings = listings[:max_results]
        
        logger.info(f"Reverb scrape completed: {len(listings)} listings found")
        return listings
        
    except Exception as e:
        logger.error(f"Error scraping Reverb: {e}")
        return []


def _scrape_reverb_page(session: requests.Session, query: str, page: int) -> List[Dict]:
    """
    Scrape a single page of Reverb search results.
    
    Args:
        session: Requests session with headers
        query: Search query
        page: Page number to scrape
    
    Returns:
        List of listing dictionaries from this page
    """
    
    try:
        # Build search URL
        encoded_query = quote_plus(query)
        url = f"{REVERB_SEARCH_URL}?query={encoded_query}&page={page}"
        
        logger.debug(f"Scraping Reverb page {page}: {url}")
        
        response = session.get(url, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find listing containers
        listing_containers = soup.find_all('div', class_='listings-item')
        
        if not listing_containers:
            # Try alternative selector
            listing_containers = soup.find_all('div', {'data-testid': 'listing-item'})
        
        logger.debug(f"Found {len(listing_containers)} listing containers on page {page}")
        
        page_listings = []
        
        for container in listing_containers:
            try:
                listing_data = _parse_reverb_listing(container)
                if listing_data:
                    page_listings.append(listing_data)
            except Exception as e:
                logger.warning(f"Error parsing Reverb listing: {e}")
                continue
        
        return page_listings
        
    except Exception as e:
        logger.error(f"Error scraping Reverb page {page}: {e}")
        return []


def _parse_reverb_listing(container) -> Optional[Dict]:
    """
    Parse a single Reverb listing container.
    
    Args:
        container: BeautifulSoup element containing listing data
    
    Returns:
        Dictionary with standardized listing data or None if parsing fails
    """
    
    try:
        # Extract basic listing information
        title_elem = container.find('h4', class_='listing-item__title') or container.find('a', class_='listing-title')
        if not title_elem:
            return None
        
        title = title_elem.get_text(strip=True)
        
        # Extract URL
        link_elem = title_elem.find('a') or title_elem
        if link_elem and link_elem.get('href'):
            url = urljoin(REVERB_BASE_URL, link_elem['href'])
        else:
            return None
        
        # Extract price
        price_elem = container.find('span', class_='listing-item__price') or container.find('div', class_='price')
        if not price_elem:
            return None
        
        price_text = price_elem.get_text(strip=True)
        price = _extract_price(price_text)
        if not price:
            return None
        
        # Extract listing ID from URL
        listing_id_match = re.search(r'/item/(\d+)', url)
        listing_id = f"reverb_{listing_id_match.group(1)}" if listing_id_match else f"reverb_{hash(url)}"
        
        # Extract seller information
        seller_elem = container.find('a', class_='listing-item__seller-name') or container.find('div', class_='seller-info')
        seller_name = seller_elem.get_text(strip=True) if seller_elem else 'Unknown'
        
        # Extract condition
        condition_elem = container.find('span', class_='listing-item__condition') or container.find('div', class_='condition')
        condition = condition_elem.get_text(strip=True) if condition_elem else None
        
        # Extract location (if available)
        location_elem = container.find('span', class_='listing-item__location') or container.find('div', class_='location')
        seller_location = location_elem.get_text(strip=True) if location_elem else None
        
        # Extract images
        img_elem = container.find('img')
        image_urls = []
        if img_elem and img_elem.get('src'):
            image_urls.append(img_elem['src'])
        
        # Parse guitar details from title
        brand, model, guitar_type = _parse_guitar_details(title)
        
        # Build standardized listing data
        listing_data = {
            'listing_id': listing_id,
            'source': 'Reverb',
            'brand': brand,
            'model': model,
            'type': guitar_type,
            'price': price,
            'seller_name': seller_name,
            'seller_location': seller_location,
            'seller_verified': False,  # Default, would need additional parsing
            'seller_rating': None,
            'seller_account_age_days': None,
            'url': url,
            'listed_date': None,  # Would need additional parsing
            'condition': condition,
            'description': title,  # Use title as basic description
            'image_urls': image_urls,
            'scraped_at': datetime.utcnow()
        }
        
        logger.debug(f"Parsed Reverb listing: {brand} {model} - ${price}")
        return listing_data
        
    except Exception as e:
        logger.warning(f"Error parsing Reverb listing container: {e}")
        return None


def _extract_price(price_text: str) -> Optional[float]:
    """
    Extract numeric price from price text.
    
    Args:
        price_text: Text containing price (e.g., "$1,299.99", "€800")
    
    Returns:
        Price as float or None if not found
    """
    
    try:
        # Remove currency symbols and extract numeric value
        cleaned = re.sub(r'[^\d.,]', '', price_text)
        cleaned = cleaned.replace(',', '')
        
        if '.' in cleaned:
            price = float(cleaned)
        else:
            price = float(cleaned)
        
        # Sanity check: guitar prices should be reasonable
        if 50 <= price <= 50000:
            return price
        
        return None
        
    except (ValueError, AttributeError):
        return None


def _parse_guitar_details(title: str) -> tuple[str, str, str]:
    """
    Parse guitar brand, model, and type from listing title.
    
    Args:
        title: Listing title text
    
    Returns:
        Tuple of (brand, model, type)
    """
    
    title_lower = title.lower()
    
    # Common guitar brands
    brands = [
        'fender', 'gibson', 'martin', 'taylor', 'yamaha', 'ibanez',
        'esp', 'prs', 'rickenbacker', 'gretsch', 'epiphone', 'squier',
        'jackson', 'dean', 'schecter', 'charvel', 'musicman', 'suhr'
    ]
    
    # Guitar types
    guitar_types = ['electric', 'acoustic', 'bass', 'classical']
    
    # Find brand
    brand = 'Unknown'
    for b in brands:
        if b in title_lower:
            brand = b.title()
            break
    
    # Find guitar type
    guitar_type = 'Electric'  # Default
    for gt in guitar_types:
        if gt in title_lower:
            guitar_type = gt.title()
            break
    
    # For bass guitars, make sure type is set correctly
    if 'bass' in title_lower:
        guitar_type = 'Bass'
    
    # Extract model (simplified approach)
    # Remove brand from title to get model
    model_text = title
    if brand != 'Unknown':
        model_text = re.sub(re.escape(brand), '', title, flags=re.IGNORECASE).strip()
    
    # Clean up model text
    model = re.sub(r'\s+', ' ', model_text).strip()
    if not model:
        model = 'Unknown Model'
    
    return brand, model, guitar_type


def get_listing_details(url: str) -> Optional[Dict]:
    """
    Get detailed information for a specific Reverb listing.
    
    Args:
        url: Direct URL to the listing
    
    Returns:
        Dictionary with detailed listing information
    """
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract detailed description
        description_elem = soup.find('div', class_='listing-description') or soup.find('div', {'data-testid': 'listing-description'})
        description = description_elem.get_text(strip=True) if description_elem else None
        
        # Extract all images
        image_gallery = soup.find('div', class_='photo-gallery') or soup.find('div', class_='listing-photos')
        image_urls = []
        
        if image_gallery:
            img_elements = image_gallery.find_all('img')
            for img in img_elements:
                if img.get('src'):
                    image_urls.append(img['src'])
        
        # Extract seller details
        seller_section = soup.find('div', class_='seller-info') or soup.find('section', class_='seller-card')
        seller_info = {}
        
        if seller_section:
            # Seller rating
            rating_elem = seller_section.find('div', class_='rating') or seller_section.find('span', class_='star-rating')
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                if rating_match:
                    seller_info['rating'] = float(rating_match.group(1))
            
            # Seller verification
            verified_elem = seller_section.find('span', class_='verified') or seller_section.find('div', class_='verified-seller')
            seller_info['verified'] = verified_elem is not None
        
        return {
            'description': description,
            'image_urls': image_urls,
            'seller_info': seller_info
        }
        
    except Exception as e:
        logger.error(f"Error getting Reverb listing details: {e}")
        return None


# Test function
if __name__ == "__main__":
    # Test the scraper
    test_results = scrape_reverb("Fender Stratocaster Electric", max_results=5)
    print(f"Test results: {len(test_results)} listings found")
    for listing in test_results:
        print(f"- {listing['brand']} {listing['model']} - ${listing['price']}") 