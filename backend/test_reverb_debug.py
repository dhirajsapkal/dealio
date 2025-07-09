#!/usr/bin/env python3
"""
Debug script to examine Reverb API response structure
"""

import aiohttp
import asyncio
import json
import os

REVERB_ACCESS_TOKEN = "b3d5326753d592a76778cf23f7df94e67a8c8e651c4b92b75e8452c3611c2b43"
REVERB_API_BASE = "https://api.reverb.com/api"

async def debug_reverb_api():
    """Debug the Reverb API response structure"""
    
    headers = {
        "Authorization": f"Bearer {REVERB_ACCESS_TOKEN}",
        "Accept": "application/hal+json",
        "Content-Type": "application/hal+json",
        "Accept-Version": "3.0"
    }
    
    print("🔍 Testing Reverb API Connection...")
    
    try:
        async with aiohttp.ClientSession() as session:
            # Test basic API connectivity
            url = f"{REVERB_API_BASE}/listings"
            params = {
                "query": "Gibson Les Paul",
                "per_page": 2,
                "item_type": "electric-guitars",
                "state": "live"
            }
            
            print(f"📡 Making request to: {url}")
            print(f"🔑 Headers: {json.dumps({k: v[:20] + '...' if k == 'Authorization' else v for k, v in headers.items()}, indent=2)}")
            print(f"📋 Params: {json.dumps(params, indent=2)}")
            
            async with session.get(url, headers=headers, params=params) as response:
                print(f"\n📊 Response Status: {response.status}")
                print(f"📋 Response Headers: {dict(response.headers)}")
                
                if response.status == 200:
                    data = await response.json()
                    print(f"\n✅ Success! Response received.")
                    print(f"📦 Response keys: {list(data.keys()) if isinstance(data, dict) else type(data)}")
                    
                    if isinstance(data, dict):
                        if "listings" in data:
                            listings = data["listings"]
                            print(f"🎸 Found {len(listings)} listings")
                            
                            if listings:
                                print(f"\n📋 First listing structure:")
                                first_listing = listings[0]
                                print(f"Type: {type(first_listing)}")
                                
                                if isinstance(first_listing, dict):
                                    print(f"Keys: {list(first_listing.keys())}")
                                    
                                    # Show key fields
                                    for key in ["id", "title", "price", "condition", "shop", "make", "model"]:
                                        if key in first_listing:
                                            value = first_listing[key]
                                            print(f"  {key}: {type(value)} = {str(value)[:100]}...")
                                else:
                                    print(f"❌ Listing is not a dict: {first_listing}")
                                    
                        else:
                            print(f"❌ No 'listings' key found in response")
                            print(f"Available keys: {list(data.keys())}")
                    else:
                        print(f"❌ Response is not a dict: {type(data)}")
                        
                elif response.status == 401:
                    print("❌ Authentication failed - check your token")
                    text = await response.text()
                    print(f"Error: {text}")
                    
                elif response.status == 403:
                    print("❌ Access forbidden - check token permissions")
                    text = await response.text()
                    print(f"Error: {text}")
                    
                else:
                    print(f"❌ API Error: {response.status}")
                    text = await response.text()
                    print(f"Error: {text}")
                    
    except Exception as e:
        print(f"❌ Connection error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_reverb_api()) 