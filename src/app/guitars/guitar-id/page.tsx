'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Star, ExternalLink, MapPin, Calendar, Shield, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GuitarSpecs {
  body: string;
  neck: string;
  fretboard: string;
  pickups: string;
  hardware: string;
  finish: string;
  scale: string;
  frets: number;
  features: string[];
}

interface GuitarData {
  id: string;
  brand: string;
  model: string;
  type: 'Electric' | 'Acoustic' | 'Bass';
  msrp: number;
  avgMarketPrice: number;
  imageUrl?: string;
  tier: string;
  specs?: GuitarSpecs;
  description?: string;
}

interface DealListing {
  id: string;
  price: number;
  marketplace: string;
  sellerLocation: string;
  datePosted: string;
  listingUrl: string;
  condition: string;
  dealScore: number;
  sellerVerified: boolean;
  description?: string;
  sellerInfo: {
    name: string;
    rating: number;
    accountAge: string;
  };
}

interface ScrapingStatus {
  isActive: boolean;
  progress: number;
  currentSource: string;
  completedSources: string[];
  totalSources: number;
  lastUpdate: string;
  nextScan: string;
}

// Helper function to get the correct API URL
const getApiUrl = () => {
  return 'http://localhost:8000';
};

function GuitarDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [guitarData, setGuitarData] = useState<GuitarData | null>(null);
  const [dealListings, setDealListings] = useState<DealListing[]>([]);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({
    isActive: false,
    progress: 0,
    currentSource: '',
    completedSources: [],
    totalSources: 6,
    lastUpdate: '',
    nextScan: ''
  });
  const [loading, setLoading] = useState(true);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load guitar data on component mount
  useEffect(() => {
    const loadGuitarData = async () => {
      try {
        const brand = searchParams.get('brand');
        const model = searchParams.get('model');
        const type = searchParams.get('type') || 'Electric';
        
        if (!brand || !model) {
          // Try to get from localStorage
          const storedGuitars = localStorage.getItem('dealio-tracked-guitars');
          if (storedGuitars) {
            const guitars = JSON.parse(storedGuitars);
            const guitar = guitars[0];
            if (guitar) {
              // Only use stored data if it has real market data
              if (!guitar.marketPrice) {
                setError('No market data available for this guitar. Please search again.');
                setLoading(false);
                return;
              }
              
              const guitarData = {
                id: guitar.id,
                brand: guitar.brand,
                model: guitar.model,
                type: guitar.type,
                msrp: guitar.specs?.msrp || guitar.marketPrice * 1.3,
                avgMarketPrice: guitar.marketPrice,
                imageUrl: guitar.imageUrl,
                tier: guitar.specs?.tier || 'Standard'
              };
              setGuitarData(guitarData);
              setLoading(false);
              loadDealsData(guitar.brand, guitar.model);
              return;
            }
          }
          setError('Guitar information not found. Please select a guitar from the dashboard.');
          setLoading(false);
          return;
        }

        // Create minimal guitar data - all real data will come from API
        const guitar: GuitarData = {
          id: `${brand.toLowerCase()}-${model.toLowerCase()}`,
          brand,
          model,
          type: type as 'Electric' | 'Acoustic' | 'Bass',
          msrp: 0, // Must be updated from API
          avgMarketPrice: 0, // Must be updated from API
          tier: 'Unknown'
        };

        setGuitarData(guitar);
        setLoading(false);
        loadDealsData(brand, model);
        
      } catch (error) {
        console.error('Error loading guitar data:', error);
        setError('Failed to load guitar information.');
        setLoading(false);
      }
    };

    loadGuitarData();
  }, [searchParams]);

  const loadDealsData = async (brand: string, model: string) => {
    try {
      setDealsLoading(true);
      setScrapingStatus(prev => ({ ...prev, isActive: true, progress: 0, currentSource: 'Initializing...' }));
      
      const response = await fetch(`${getApiUrl()}/guitars/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update guitar data with API info - require real data
        if (!data.market_price || !data.guitar_specs) {
          throw new Error('API must provide complete guitar data including specs and market price');
        }
        
        setGuitarData(prev => prev ? {
          ...prev,
          avgMarketPrice: data.market_price,
          msrp: data.guitar_specs.msrp,
          imageUrl: data.guitar_image,
          tier: data.guitar_specs.tier,
          specs: {
            body: data.guitar_specs.body,
            neck: data.guitar_specs.neck,
            fretboard: data.guitar_specs.fretboard,
            pickups: data.guitar_specs.pickups,
            hardware: data.guitar_specs.hardware,
            finish: data.guitar_specs.finish,
            scale: data.guitar_specs.scale_length,
            frets: data.guitar_specs.frets,
            features: data.guitar_specs.features
          }
        } : null);
        
        // Process listings - require real data only
        if (!data.listings || !Array.isArray(data.listings)) {
          throw new Error('API must provide real listings data');
        }
        
        const allListings: DealListing[] = data.listings.map((listing: any, index: number) => {
          // Validate required fields
          if (!listing.listing_id || !listing.price || !listing.source || !listing.url) {
            throw new Error('Invalid listing data - missing required fields');
          }
          
          return {
            id: listing.listing_id,
            price: listing.price,
            marketplace: listing.source,
            sellerLocation: listing.seller_location,
            datePosted: listing.listed_date ? new Date(listing.listed_date).toLocaleDateString() : new Date().toLocaleDateString(),
            listingUrl: listing.url,
            condition: listing.condition,
            dealScore: listing.deal_score,
            sellerVerified: listing.seller_verified,
            description: listing.description,
            sellerInfo: {
              name: listing.seller_name,
              rating: listing.seller_rating,
              accountAge: listing.seller_account_age_days ? `${Math.floor(listing.seller_account_age_days / 365)} years` : 'New'
            }
          };
        });
        
        // Sort by deal score (highest first)
        allListings.sort((a, b) => b.dealScore - a.dealScore);
        
        // Simulate progressive loading
        const sources = ['Reverb', 'eBay', 'Facebook', 'Craigslist', 'Guitar Center', 'Sweetwater'];
        
        for (let i = 0; i < sources.length; i++) {
          const source = sources[i];
          const progress = ((i + 1) / sources.length) * 100;
          
          setScrapingStatus(prev => ({
            ...prev,
            currentSource: source,
            progress: progress,
            completedSources: sources.slice(0, i + 1)
          }));

          if (i === 0) {
            setDealListings(allListings.slice(0, 2));
          } else if (i === sources.length - 1) {
            setDealListings(allListings);
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      setScrapingStatus(prev => ({
        ...prev,
        isActive: false,
        lastUpdate: new Date().toLocaleTimeString(),
        nextScan: new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleTimeString()
      }));
      
    } catch (error) {
      console.error('Error loading deals:', error);
      setScrapingStatus(prev => ({ ...prev, isActive: false }));
    } finally {
      setDealsLoading(false);
    }
  };

  const handleManualRefresh = () => {
    if (guitarData && !scrapingStatus.isActive) {
      loadDealsData(guitarData.brand, guitarData.model);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Deal';
    if (score >= 80) return 'Great Deal';
    if (score >= 70) return 'Good Deal';
    return 'Fair Deal';
  };

  const getPriceChange = (currentPrice: number, msrp: number) => {
    const change = ((currentPrice - msrp) / msrp) * 100;
    return Math.round(change);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Guitar Details</h2>
          <p className="text-gray-600">Fetching the latest deal information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !guitarData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Guitar</h2>
          <p className="text-gray-600 mb-4">{error || 'Guitar not found'}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                {guitarData.brand} {guitarData.model}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={scrapingStatus.isActive}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${scrapingStatus.isActive ? 'animate-spin' : ''}`} />
                {scrapingStatus.isActive ? 'Scanning...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          {scrapingStatus.isActive && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Scanning {scrapingStatus.currentSource}...</span>
                <span>{Math.round(scrapingStatus.progress)}%</span>
              </div>
              <Progress value={scrapingStatus.progress} className="h-2" />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Guitar Info & Specs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Guitar Image & Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  {guitarData.imageUrl ? (
                    <img 
                      src={guitarData.imageUrl} 
                      alt={`${guitarData.brand} ${guitarData.model}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 text-gray-400">🎸</div>
                      <p className="text-sm text-gray-500">No image available</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{guitarData.brand}</h2>
                    <p className="text-lg text-gray-700">{guitarData.model}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{guitarData.type}</Badge>
                    <Badge variant="outline">{guitarData.tier}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pricing Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">MSRP</p>
                    <p className="text-lg font-semibold">${guitarData.msrp}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Market</p>
                    <p className="text-lg font-semibold">${guitarData.avgMarketPrice}</p>
                  </div>
                </div>
                
                {dealListings.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Best Deal Found</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">${dealListings[0].price}</p>
                        <p className="text-sm text-gray-500">
                          {getPriceChange(dealListings[0].price, guitarData.msrp)}% vs MSRP
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specifications */}
            {guitarData.specs && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Body</dt>
                      <dd className="text-sm font-medium">{guitarData.specs.body}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Neck</dt>
                      <dd className="text-sm font-medium">{guitarData.specs.neck}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Fretboard</dt>
                      <dd className="text-sm font-medium">{guitarData.specs.fretboard}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Pickups</dt>
                      <dd className="text-sm font-medium">{guitarData.specs.pickups}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Scale Length</dt>
                      <dd className="text-sm font-medium">{guitarData.specs.scale}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Frets</dt>
                      <dd className="text-sm font-medium">{guitarData.specs.frets}</dd>
                    </div>
                  </dl>
                  
                  {guitarData.specs?.features && guitarData.specs.features.length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">Key Features</p>
                      <div className="flex flex-wrap gap-1">
                        {guitarData.specs.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Deal Listings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Available Deals</CardTitle>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {dealsLoading ? 'Loading...' : `${dealListings.length} listings found`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sorted by deal score
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {dealsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dealListings.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deals Found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any listings for this guitar right now.
                    </p>
                    <Button onClick={handleManualRefresh} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dealListings.map((deal, index) => (
                      <div 
                        key={deal.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => window.open(deal.listingUrl, '_blank')}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <Badge 
                                variant="secondary" 
                                className={getScoreColor(deal.dealScore)}
                              >
                                {deal.dealScore}/100 - {getScoreLabel(deal.dealScore)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xl font-bold text-gray-900">${deal.price}</p>
                                <p className="text-sm text-gray-600">{deal.condition}</p>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-900">{deal.marketplace}</p>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin className="w-3 h-3" />
                                  {deal.sellerLocation}
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{deal.sellerInfo.name}</span>
                                  {deal.sellerVerified && (
                                    <Shield className="w-3 h-3 text-green-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {deal.sellerInfo.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                                      {deal.sellerInfo.rating}
                                    </div>
                                  )}
                                  <Calendar className="w-3 h-3" />
                                  {deal.datePosted}
                                </div>
                              </div>
                            </div>
                            
                            {deal.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {deal.description}
                              </p>
                            )}
                          </div>
                          
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GuitarDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Guitar Details</h2>
          <p className="text-gray-600">Fetching the latest deal information...</p>
        </div>
      </div>
    }>
      <GuitarDetailPageContent />
    </Suspense>
  );
} 