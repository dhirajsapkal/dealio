"""
Dynamic Deals Generator - Creates realistic marketplace listings for any guitar
Uses real marketplace data patterns to generate convincing deal listings
"""

import random
from typing import Dict, List, Optional
from datetime import datetime, timedelta
try:
    from guitar_specs_api import get_guitar_specs_sync
    GUITAR_SPECS_AVAILABLE = True
except ImportError:
    GUITAR_SPECS_AVAILABLE = False
    
    def get_guitar_specs_sync(brand: str, model: str) -> Dict:
        """Fallback function when guitar specs API is not available"""
        return {"msrp": 1200, "type": "Electric"}


class DynamicDealsGenerator:
    def __init__(self):
        self.marketplaces = [
            {"name": "Reverb", "weight": 35, "verification_rate": 0.85},
            {"name": "eBay", "weight": 25, "verification_rate": 0.60},
            {"name": "Facebook Marketplace", "weight": 20, "verification_rate": 0.45},
            {"name": "Craigslist", "weight": 10, "verification_rate": 0.30},
            {"name": "Guitar Center Used", "weight": 5, "verification_rate": 0.95},
            {"name": "Sweetwater Gear Exchange", "weight": 3, "verification_rate": 0.90},
            {"name": "Sam Ash Used", "weight": 2, "verification_rate": 0.85}
        ]
        
        self.conditions = [
            {"name": "Mint", "price_factor": 0.95, "weight": 5},
            {"name": "Excellent", "price_factor": 0.85, "weight": 25},
            {"name": "Very Good", "price_factor": 0.75, "weight": 35},
            {"name": "Good", "price_factor": 0.65, "weight": 25},
            {"name": "Fair", "price_factor": 0.50, "weight": 8},
            {"name": "Poor", "price_factor": 0.35, "weight": 2}
        ]
        
        self.cities = [
            "Los Angeles, CA", "New York, NY", "Chicago, IL", "Austin, TX", "Nashville, TN",
            "Seattle, WA", "Portland, OR", "Denver, CO", "Atlanta, GA", "Miami, FL",
            "Boston, MA", "San Francisco, CA", "Phoenix, AZ", "Philadelphia, PA", "Detroit, MI",
            "Minneapolis, MN", "Kansas City, MO", "Richmond, VA", "Charlotte, NC", "Salt Lake City, UT"
        ]
    
    def generate_deals(self, brand: str, model: str, num_deals: int = 12) -> List[Dict]:
        """Generate realistic deal listings for a guitar"""
        
        # Get guitar specifications for pricing baseline
        guitar_specs = get_guitar_specs_sync(brand, model)
        base_msrp = guitar_specs.get("msrp", 1200)
        
        deals = []
        
        for i in range(num_deals):
            deal = self._create_realistic_deal(brand, model, base_msrp, i)
            deals.append(deal)
        
        # Sort by deal score (highest first)
        deals.sort(key=lambda x: x["dealScore"], reverse=True)
        
        return deals
    
    def _create_realistic_deal(self, brand: str, model: str, base_msrp: int, index: int) -> Dict:
        """Create a single realistic deal listing"""
        
        # Select marketplace
        marketplace = self._select_weighted_choice(self.marketplaces)
        
        # Select condition
        condition_data = self._select_weighted_choice(self.conditions)
        condition = condition_data["name"]
        
        # Calculate base price with condition factor
        base_price = int(base_msrp * condition_data["price_factor"])
        
        # Add market fluctuation (±15%)
        price_variation = random.uniform(0.85, 1.15)
        actual_price = int(base_price * price_variation)
        
        # Apply marketplace-specific adjustments
        if marketplace["name"] == "Guitar Center Used":
            actual_price = int(actual_price * 1.05)  # Slightly higher prices
        elif marketplace["name"] in ["Craigslist", "Facebook Marketplace"]:
            actual_price = int(actual_price * 0.90)  # Lower prices for private sales
        
        # Generate posting date (recent)
        days_ago = random.randint(1, 30)
        posted_date = datetime.now() - timedelta(days=days_ago)
        
        # Calculate deal score based on price vs MSRP
        deal_score = self._calculate_deal_score(actual_price, base_msrp, condition_data["price_factor"])
        
        # Generate seller info
        seller_info = self._generate_seller_info(marketplace)
        
        # Create listing description
        description = self._generate_listing_description(brand, model, condition)
        
        return {
            "id": f"deal-{index}-{random.randint(1000, 9999)}",
            "price": actual_price,
            "marketplace": marketplace["name"],
            "sellerLocation": random.choice(self.cities),
            "datePosted": posted_date.strftime("%Y-%m-%d"),
            "listingUrl": self._generate_listing_url(marketplace["name"], brand, model),
            "condition": condition,
            "dealScore": deal_score,
            "sellerVerified": random.random() < marketplace["verification_rate"],
            "description": description,
            "sellerInfo": seller_info,
            "shipping": self._get_shipping_info(marketplace["name"]),
            "images": random.randint(3, 8),
            "watchers": random.randint(0, 25) if marketplace["name"] == "eBay" else 0,
            "timeLeft": self._get_time_left(marketplace["name"]) if marketplace["name"] == "eBay" else None
        }
    
    def _select_weighted_choice(self, choices: List[Dict]) -> Dict:
        """Select an item based on weighted probability"""
        
        total_weight = sum(choice["weight"] for choice in choices)
        rand_num = random.uniform(0, total_weight)
        
        cumulative = 0
        for choice in choices:
            cumulative += choice["weight"]
            if rand_num <= cumulative:
                return choice
        
        return choices[-1]  # Fallback
    
    def _calculate_deal_score(self, price: int, msrp: int, condition_factor: float) -> int:
        """Calculate deal score (0-100) based on price vs expected value"""
        
        # Expected used price for this condition
        expected_price = msrp * condition_factor
        
        # Calculate savings vs expected price
        savings_percentage = (expected_price - price) / expected_price
        
        # Base score from savings
        base_score = min(100, max(0, int(50 + (savings_percentage * 100))))
        
        # Adjust for absolute price ranges
        if price < 500:
            base_score += 5  # Bonus for budget guitars
        elif price > 3000:
            base_score -= 5  # Penalty for expensive guitars (harder deals)
        
        # Add some randomness for realistic variation
        score_noise = random.randint(-8, 8)
        final_score = max(30, min(98, base_score + score_noise))
        
        return final_score
    
    def _generate_seller_info(self, marketplace: Dict) -> Dict:
        """Generate realistic seller information"""
        
        # Seller names
        first_names = ["Mike", "Sarah", "Dave", "Jessica", "Chris", "Amanda", "John", "Lisa", "Ryan", "Emily"]
        last_names = ["Johnson", "Smith", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson"]
        
        # Business names for higher-end marketplaces
        business_names = [
            "Guitar Haven", "Music Exchange", "Vintage Strings", "Axe Music", "The Guitar Shop",
            "String Theory Music", "Harmony Music Store", "Six String Central", "Melody Music"
        ]
        
        is_business = marketplace["verification_rate"] > 0.8 and random.random() < 0.3
        
        if is_business:
            seller_name = random.choice(business_names)
            rating = round(random.uniform(4.7, 5.0), 1)
            account_age = random.randint(5, 15)
        else:
            seller_name = f"{random.choice(first_names)} {random.choice(last_names)[0]}."
            rating = round(random.uniform(4.2, 4.9), 1)
            account_age = random.randint(1, 8)
        
        return {
            "name": seller_name,
            "rating": rating,
            "accountAge": f"{account_age} years",
            "responseTime": f"{random.randint(1, 24)} hours",
            "salesCount": random.randint(5, 200) if is_business else random.randint(1, 50)
        }
    
    def _generate_listing_description(self, brand: str, model: str, condition: str) -> str:
        """Generate realistic listing description"""
        
        descriptions = [
            f"Beautiful {brand} {model} in {condition.lower()} condition. Well maintained and plays great!",
            f"Selling my {brand} {model}. {condition} condition with normal wear. Sounds amazing.",
            f"Great {brand} {model} looking for a new home. {condition} condition, no major issues.",
            f"Excellent {brand} {model} in {condition.lower()} shape. Perfect for gigging or studio work.",
            f"Clean {brand} {model}. {condition} condition with some minor wear but plays perfectly.",
            f"Amazing {brand} {model}! {condition} condition. Hate to see it go but need the space.",
            f"Well-cared-for {brand} {model}. {condition} condition. Great tone and feel.",
            f"Professional {brand} {model} in {condition.lower()} condition. Ready to rock!"
        ]
        
        base_description = random.choice(descriptions)
        
        # Add condition-specific details
        if condition == "Mint":
            base_description += " Like new with minimal play wear."
        elif condition == "Excellent":
            base_description += " Very clean with minor signs of use."
        elif condition == "Good":
            base_description += " Some visible wear but all original and functional."
        elif condition == "Fair":
            base_description += " Shows wear but still plays well. Good project guitar."
        
        return base_description
    
    def _generate_listing_url(self, marketplace: str, brand: str, model: str) -> str:
        """Generate realistic listing URL"""
        
        urls = {
            "Reverb": f"https://reverb.com/item/{random.randint(10000000, 99999999)}",
            "eBay": f"https://ebay.com/itm/{random.randint(100000000000, 999999999999)}",
            "Facebook Marketplace": f"https://facebook.com/marketplace/item/{random.randint(100000000000000, 999999999999999)}",
            "Craigslist": f"https://craigslist.org/msg/{random.randint(7000000000, 7999999999)}.html",
            "Guitar Center Used": f"https://guitarcenter.com/Used/{brand}-{model}/{random.randint(100000, 999999)}.gc",
            "Sweetwater Gear Exchange": f"https://sweetwater.com/used/{random.randint(100000, 999999)}",
            "Sam Ash Used": f"https://samash.com/used-gear/{random.randint(100000, 999999)}"
        }
        
        return urls.get(marketplace, "#")
    
    def _get_shipping_info(self, marketplace: str) -> Dict:
        """Get shipping information based on marketplace"""
        
        if marketplace in ["Guitar Center Used", "Sweetwater Gear Exchange", "Sam Ash Used"]:
            return {
                "cost": 0,
                "time": "2-3 business days",
                "note": "Free shipping"
            }
        elif marketplace == "Reverb":
            return {
                "cost": random.choice([0, 25, 35, 45]),
                "time": "3-5 business days",
                "note": "Calculated at checkout"
            }
        elif marketplace == "eBay":
            return {
                "cost": random.choice([0, 20, 30, 40]),
                "time": "3-7 business days",
                "note": "See item details"
            }
        else:  # Local marketplaces
            return {
                "cost": 0,
                "time": "Local pickup",
                "note": "Cash only"
            }
    
    def _get_time_left(self, marketplace: str) -> Optional[str]:
        """Get time left for auction-style listings"""
        
        if marketplace == "eBay" and random.random() < 0.3:  # 30% are auctions
            days = random.randint(0, 7)
            hours = random.randint(0, 23)
            minutes = random.randint(0, 59)
            return f"{days}d {hours}h {minutes}m"
        
        return None


# Global instance
deals_generator = DynamicDealsGenerator()


def generate_guitar_deals(brand: str, model: str, count: int = 12) -> List[Dict]:
    """Generate dynamic deals for any guitar brand/model combination"""
    return deals_generator.generate_deals(brand, model, count)


def get_deal_summary_stats(deals: List[Dict]) -> Dict:
    """Get summary statistics for a list of deals"""
    
    if not deals:
        return {}
    
    prices = [deal["price"] for deal in deals]
    scores = [deal["dealScore"] for deal in deals]
    
    return {
        "total_listings": len(deals),
        "price_range": {
            "min": min(prices),
            "max": max(prices),
            "avg": int(sum(prices) / len(prices))
        },
        "avg_deal_score": int(sum(scores) / len(scores)),
        "top_marketplaces": _get_top_marketplaces(deals),
        "condition_breakdown": _get_condition_breakdown(deals)
    }


def _get_top_marketplaces(deals: List[Dict]) -> List[Dict]:
    """Get top marketplaces by listing count"""
    
    marketplace_counts = {}
    for deal in deals:
        marketplace = deal["marketplace"]
        marketplace_counts[marketplace] = marketplace_counts.get(marketplace, 0) + 1
    
    sorted_marketplaces = sorted(marketplace_counts.items(), key=lambda x: x[1], reverse=True)
    
    return [{"name": name, "count": count} for name, count in sorted_marketplaces[:3]]


def _get_condition_breakdown(deals: List[Dict]) -> Dict:
    """Get breakdown of deals by condition"""
    
    condition_counts = {}
    for deal in deals:
        condition = deal["condition"]
        condition_counts[condition] = condition_counts.get(condition, 0) + 1
    
    return condition_counts 