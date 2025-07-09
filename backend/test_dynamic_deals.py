#!/usr/bin/env python3
"""
Test script for the dynamic deals generation system
Demonstrates the new capabilities without requiring FastAPI
"""

import sys
import json
from dynamic_deals_generator import generate_guitar_deals, get_deal_summary_stats
from guitar_specs_api import get_guitar_specs_sync

def test_dynamic_deals():
    """Test the dynamic deals generation for various guitar combinations"""
    
    test_guitars = [
        ("Schecter", "Hellraiser"),
        ("Fender", "Stratocaster"),
        ("Gibson", "Les Paul"),
        ("Ibanez", "RG550"),
        ("ESP", "Eclipse"),
        ("Jackson", "Soloist")
    ]
    
    print("🎸 DYNAMIC GUITAR DEAL GENERATION TEST 🎸")
    print("=" * 60)
    
    for brand, model in test_guitars:
        print(f"\n📊 Testing: {brand} {model}")
        print("-" * 40)
        
        try:
            # Get guitar specifications
            specs = get_guitar_specs_sync(brand, model)
            print(f"✅ Guitar Specs Retrieved:")
            print(f"   • MSRP: ${specs.get('msrp', 'N/A')}")
            print(f"   • Type: {specs.get('type', 'N/A')}")
            print(f"   • Body: {specs.get('body', 'N/A')}")
            print(f"   • Pickups: {specs.get('pickups', 'N/A')}")
            
            # Generate deals
            deals = generate_guitar_deals(brand, model, count=8)
            print(f"✅ Generated {len(deals)} deals")
            
            # Get statistics
            stats = get_deal_summary_stats(deals)
            print(f"📈 Deal Statistics:")
            print(f"   • Price Range: ${stats['price_range']['min']} - ${stats['price_range']['max']}")
            print(f"   • Average Price: ${stats['price_range']['avg']}")
            print(f"   • Average Deal Score: {stats['avg_deal_score']}")
            
            # Show top 3 deals
            print(f"🏆 Top 3 Deals:")
            for i, deal in enumerate(deals[:3], 1):
                print(f"   {i}. {deal['marketplace']} - ${deal['price']} "
                      f"({deal['condition']}) - Score: {deal['dealScore']}")
                print(f"      📍 {deal['sellerLocation']} • "
                      f"{'✅' if deal['sellerVerified'] else '❌'} Verified")
            
        except Exception as e:
            print(f"❌ Error testing {brand} {model}: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Dynamic deals system test completed!")
    print("\nKey Features Demonstrated:")
    print("• ✅ Real guitar specifications generation")
    print("• ✅ Dynamic marketplace deal creation")
    print("• ✅ Realistic pricing based on MSRP and condition")
    print("• ✅ Multiple marketplace simulation")
    print("• ✅ Seller verification and ratings")
    print("• ✅ Geographic distribution")
    print("• ✅ Deal scoring algorithm")

def test_specific_guitar():
    """Test a specific guitar with detailed output"""
    
    if len(sys.argv) > 2:
        brand = sys.argv[1]
        model = sys.argv[2]
    else:
        brand = "Schecter"
        model = "Hellraiser"
    
    print(f"\n🔍 DETAILED TEST: {brand} {model}")
    print("=" * 60)
    
    # Get specs
    specs = get_guitar_specs_sync(brand, model)
    print("📋 Guitar Specifications:")
    for key, value in specs.items():
        if isinstance(value, list):
            print(f"   • {key.title()}: {', '.join(value)}")
        else:
            print(f"   • {key.title()}: {value}")
    
    # Generate deals
    deals = generate_guitar_deals(brand, model, count=12)
    
    print(f"\n💰 Generated {len(deals)} Deal Listings:")
    print("-" * 60)
    
    for i, deal in enumerate(deals, 1):
        condition_emoji = {
            "Mint": "💎", "Excellent": "⭐", "Very Good": "👍",
            "Good": "👌", "Fair": "⚠️", "Poor": "🔧"
        }.get(deal["condition"], "❓")
        
        marketplace_emoji = {
            "Reverb": "🎵", "eBay": "🛒", "Facebook Marketplace": "📘",
            "Craigslist": "📰", "Guitar Center Used": "🏪",
            "Sweetwater Gear Exchange": "🍯", "Sam Ash Used": "🎸"
        }.get(deal["marketplace"], "🛍️")
        
        print(f"{i:2d}. {marketplace_emoji} {deal['marketplace']}")
        print(f"    💵 ${deal['price']} • {condition_emoji} {deal['condition']} • "
              f"🎯 Score: {deal['dealScore']}")
        print(f"    👤 {deal['sellerInfo']['name']} "
              f"({'✅' if deal['sellerVerified'] else '❌'} {deal['sellerInfo']['rating']}⭐)")
        print(f"    📍 {deal['sellerLocation']} • 📅 {deal['datePosted']}")
        if deal.get('timeLeft'):
            print(f"    ⏰ Time left: {deal['timeLeft']}")
        print()
    
    # Summary
    prices = [d['price'] for d in deals]
    scores = [d['dealScore'] for d in deals]
    
    print("📊 SUMMARY:")
    print(f"   • Total Listings: {len(deals)}")
    print(f"   • Price Range: ${min(prices)} - ${max(prices)}")
    print(f"   • Average Price: ${sum(prices) // len(prices)}")
    print(f"   • Best Deal Score: {max(scores)}")
    print(f"   • Average Deal Score: {sum(scores) // len(scores)}")
    
    # Export to JSON for frontend testing
    output_file = f"{brand}_{model}_deals.json"
    with open(output_file, 'w') as f:
        json.dump({
            "guitar_specs": specs,
            "deals": deals,
            "summary": {
                "total_listings": len(deals),
                "price_range": {"min": min(prices), "max": max(prices), "avg": sum(prices) // len(prices)},
                "score_range": {"min": min(scores), "max": max(scores), "avg": sum(scores) // len(scores)}
            }
        }, f, indent=2)
    
    print(f"\n💾 Exported to {output_file} for frontend testing")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "detailed":
        test_specific_guitar()
    else:
        test_dynamic_deals()
        print("\n💡 Run with 'detailed [brand] [model]' for detailed output")
        print("   Example: python3 test_dynamic_deals.py detailed Schecter Hellraiser") 