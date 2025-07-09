"""
Guitar Deal Scrapers Package
Contains scraping modules for various guitar marketplaces.
"""

from .reverb import scrape_reverb
from .facebook import scrape_facebook
from .craigslist import scrape_craigslist
from .ebay import scrape_ebay
from .guitar_center import scrape_guitar_center
from .sweetwater import scrape_sweetwater

# Available scrapers mapping
SCRAPERS = {
    'reverb': scrape_reverb,
    'facebook': scrape_facebook,
    'craigslist': scrape_craigslist,
    'ebay': scrape_ebay,
    'guitar_center': scrape_guitar_center,
    'sweetwater': scrape_sweetwater
}

# Priority order for scraping (high to low)
SCRAPER_PRIORITY = [
    'reverb',
    'facebook', 
    'craigslist',
    'ebay',
    'guitar_center',
    'sweetwater'
]

__all__ = [
    'SCRAPERS',
    'SCRAPER_PRIORITY',
    'scrape_reverb',
    'scrape_facebook',
    'scrape_craigslist', 
    'scrape_ebay',
    'scrape_guitar_center',
    'scrape_sweetwater'
] 