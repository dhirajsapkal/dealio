"""
SQLAlchemy ORM Models for Guitar Deal Tracker
Defines the database schema for guitar listings and related data.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import List, Optional

Base = declarative_base()


class GuitarListing(Base):
    """
    Main model for storing guitar listings scraped from various marketplaces.
    Represents a single guitar listing with all relevant details for deal analysis.
    """
    __tablename__ = 'guitar_listings'

    # Primary key and unique identifiers
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(String, unique=True, index=True, nullable=False)  # Unique ID from marketplace
    
    # Source marketplace information
    source = Column(String, nullable=False, index=True)  # Facebook, Reverb, eBay, etc.
    
    # Guitar details
    brand = Column(String, nullable=False, index=True)  # Fender, Gibson, etc.
    model = Column(String, nullable=False, index=True)  # Stratocaster, Les Paul, etc.
    type = Column(String, nullable=False)  # Electric, Acoustic, Bass
    
    # Pricing information
    price = Column(Float, nullable=False, index=True)  # Current listing price
    original_price = Column(Float, nullable=True)  # Original price if on sale
    
    # Seller information
    seller_name = Column(String, nullable=True)
    seller_location = Column(String, nullable=True)
    seller_verified = Column(Boolean, default=False, nullable=False)
    seller_rating = Column(Float, nullable=True)  # Rating out of 5
    seller_account_age_days = Column(Integer, default=0, nullable=False)
    seller_total_sales = Column(Integer, nullable=True)  # Number of items sold
    
    # Listing details
    url = Column(String, nullable=False)  # Direct link to listing
    listed_date = Column(DateTime, nullable=True)  # When listing was posted
    condition = Column(String, nullable=True)  # New, Excellent, Very Good, etc.
    description = Column(Text, nullable=True)  # Full listing description
    image_urls = Column(JSON, nullable=True)  # List of image URLs
    
    # Analysis and tracking
    deal_score = Column(Float, nullable=True)  # Calculated deal score (0-100)
    avg_market_price = Column(Float, nullable=True)  # Market reference price
    price_below_market_pct = Column(Float, nullable=True)  # Percentage below market
    
    # Metadata
    scraped_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True, nullable=False)  # False if listing expired
    
    def __repr__(self):
        return f"<GuitarListing(id={self.id}, {self.brand} {self.model}, ${self.price}, {self.source})>"
    
    def to_dict(self) -> dict:
        """Convert model instance to dictionary for API responses."""
        return {
            'id': self.id,
            'listing_id': self.listing_id,
            'source': self.source,
            'brand': self.brand,
            'model': self.model,
            'type': self.type,
            'price': self.price,
            'original_price': self.original_price,
            'seller_name': self.seller_name,
            'seller_location': self.seller_location,
            'seller_verified': self.seller_verified,
            'seller_rating': self.seller_rating,
            'seller_account_age_days': self.seller_account_age_days,
            'seller_total_sales': self.seller_total_sales,
            'url': self.url,
            'listed_date': self.listed_date.isoformat() if self.listed_date else None,
            'condition': self.condition,
            'description': self.description,
            'image_urls': self.image_urls,
            'deal_score': self.deal_score,
            'avg_market_price': self.avg_market_price,
            'price_below_market_pct': self.price_below_market_pct,
            'scraped_at': self.scraped_at.isoformat() if self.scraped_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }


class TrackedGuitar(Base):
    """
    Model for storing user-tracked guitars.
    Users can add guitars they want to monitor for deals.
    """
    __tablename__ = 'tracked_guitars'

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    type = Column(String, nullable=False)  # Electric, Acoustic, Bass
    
    # User preferences
    max_price = Column(Float, nullable=True)  # Alert if price goes below this
    min_condition = Column(String, nullable=True)  # Minimum acceptable condition
    preferred_locations = Column(JSON, nullable=True)  # List of preferred seller locations
    
    # Tracking metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_checked = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    def __repr__(self):
        return f"<TrackedGuitar(id={self.id}, {self.brand} {self.model}, {self.type})>"
    
    def to_dict(self) -> dict:
        """Convert model instance to dictionary for API responses."""
        return {
            'id': self.id,
            'brand': self.brand,
            'model': self.model,
            'type': self.type,
            'max_price': self.max_price,
            'min_condition': self.min_condition,
            'preferred_locations': self.preferred_locations,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_checked': self.last_checked.isoformat() if self.last_checked else None,
            'is_active': self.is_active
        }


class MarketPrice(Base):
    """
    Model for storing historical market price data for guitar models.
    Used to calculate average market prices for deal scoring.
    """
    __tablename__ = 'market_prices'

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, nullable=False, index=True)
    model = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    
    # Price statistics
    avg_price = Column(Float, nullable=False)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    median_price = Column(Float, nullable=False)
    
    # Data collection info
    sample_size = Column(Integer, nullable=False)  # Number of listings used for calculation
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<MarketPrice({self.brand} {self.model}, avg=${self.avg_price}, n={self.sample_size})>"
    
    def to_dict(self) -> dict:
        """Convert model instance to dictionary for API responses."""
        return {
            'id': self.id,
            'brand': self.brand,
            'model': self.model,
            'type': self.type,
            'avg_price': self.avg_price,
            'min_price': self.min_price,
            'max_price': self.max_price,
            'median_price': self.median_price,
            'sample_size': self.sample_size,
            'calculated_at': self.calculated_at.isoformat() if self.calculated_at else None
        } 