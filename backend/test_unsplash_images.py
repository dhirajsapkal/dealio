#!/usr/bin/env python3
"""
Test script for Unsplash image integration
"""

import asyncio
from guitar_specs_api import GuitarSpecsAPI

async def test_unsplash_images():
    """Test Unsplash image fetching for various guitars"""
    
    print("🖼️  UNSPLASH IMAGE INTEGRATION TEST 🖼️")
    print("=" * 60)
    
    api = GuitarSpecsAPI()
    
    # Test guitars with different brands and types
    test_guitars = [
        ("Gibson", "Les Paul", "Electric"),
        ("Fender", "Stratocaster", "Electric"),
        ("Martin", "D-28", "Acoustic"),
        ("Taylor", "814ce", "Acoustic"),
        ("Ibanez", "RG550", "Electric"),
        ("Schecter", "Hellraiser", "Electric")
    ]
    
    for brand, model, guitar_type in test_guitars:
        print(f"\n📸 Testing: {brand} {model} ({guitar_type})")
        print("-" * 40)
        
        try:
            # Get guitar specifications including image
            specs = await api.get_guitar_specifications(brand, model)
            image_url = await api.get_guitar_image(brand, model, guitar_type)
            
            print(f"✅ Specs Retrieved:")
            print(f"   • Brand: {specs['brand']}")
            print(f"   • Model: {specs['model']}")
            print(f"   • Type: {specs['type']}")
            print(f"   • MSRP: ${specs['msrp']}")
            
            print(f"🖼️  Image URL: {image_url}")
            
            # Check if it's a real Unsplash URL or placeholder
            if "unsplash.com" in image_url:
                print("✅ Real Unsplash image fetched!")
            else:
                print("⚠️  Using placeholder image")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Unsplash integration test completed!")
    print("\nNotes:")
    print("• Real images are fetched from Unsplash based on guitar searches")
    print("• Fallback to placeholders if specific guitar not found")
    print("• Images are cached to avoid redundant API calls")

if __name__ == "__main__":
    asyncio.run(test_unsplash_images()) 