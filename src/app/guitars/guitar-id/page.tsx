'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  imageUrl?: string;
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
  // Use environment variable for production/preview, with a fallback for local development.
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
  // Add smooth progress tracking
  const [smoothProgress, setSmoothProgress] = useState(0);

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

  // Smooth progress bar animation effect
  useEffect(() => {
    if (!scrapingStatus.isActive) {
      setSmoothProgress(0);
      return;
    }

    const targetProgress = scrapingStatus.progress;
    const currentProgress = smoothProgress;
    
    if (Math.abs(targetProgress - currentProgress) < 1) {
      setSmoothProgress(targetProgress);
      return;
    }

    // Smooth interpolation with faster initial movement, slower near target
    const animateProgress = () => {
      setSmoothProgress(prev => {
        const diff = targetProgress - prev;
        const increment = Math.max(0.5, Math.abs(diff) * 0.15); // Dynamic speed
        
        if (diff > 0) {
          return Math.min(targetProgress, prev + increment);
        } else if (diff < 0) {
          return Math.max(targetProgress, prev - increment);
        }
        return prev;
      });
    };

    const interval = setInterval(animateProgress, 16); // 60fps
    return () => clearInterval(interval);
  }, [scrapingStatus.progress, scrapingStatus.isActive, smoothProgress]);

  const loadDealsData = async (brand: string, model: string) => {
    try {
      setDealsLoading(true);
      setScrapingStatus(prev => ({ ...prev, isActive: true, progress: 0, currentSource: 'Initializing...' }));
      
      const response = await fetch(`${getApiUrl()}/guitars/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎸 Guitar Details API Response:', data);
        console.log('🎸 Available data keys:', Object.keys(data));
        console.log('🎸 Deals structure:', data.deals ? Object.keys(data.deals) : 'No deals object');
        console.log('🎸 Number of deals:', data.deals?.all?.length || 'Unknown');
        
        // Update guitar data with real API info - prioritize real data
        if (data.guitarData || data.marketData) {
          setGuitarData(prev => prev ? {
            ...prev,
            avgMarketPrice: data.marketData?.averagePrice || data.marketData?.market_price || prev.avgMarketPrice,
            msrp: data.guitarData?.specs?.msrp || (data.marketData?.averagePrice * 1.3) || prev.msrp,
            imageUrl: data.guitarData?.imageUrl || prev.imageUrl, // Use real Reverb image
            tier: data.guitarData?.specs?.tier || prev.tier,
            specs: data.guitarData?.specs ? {
              body: data.guitarData.specs.body || 'Not specified',
              neck: data.guitarData.specs.neck || 'Not specified',
              fretboard: data.guitarData.specs.fretboard || 'Not specified',
              pickups: data.guitarData.specs.pickups || 'Not specified',
              hardware: data.guitarData.specs.hardware || 'Not specified',
              finish: data.guitarData.specs.finish || 'Not specified',
              scale: data.guitarData.specs.scale_length || data.guitarData.specs.scale || 'Not specified',
              frets: data.guitarData.specs.frets || 22,
              features: data.guitarData.specs.features || []
            } : prev.specs
          } : null);
        }
        
        // Process listings - ensure we have real data with proper deal scores
        let allListings: DealListing[] = [];
        
        if (data.deals && data.deals.all && Array.isArray(data.deals.all)) {
          console.log('🎸 Processing deals.all with', data.deals.all.length, 'listings');
          allListings = data.deals.all.map((listing: any) => {
            console.log('🎸 Processing listing:', listing);
            
            // Validate required fields for real listings
            if (!listing.price || !listing.source || !listing.listingUrl) {
              console.warn('⚠️ Invalid listing data:', listing);
              return null;
            }
            
            // Calculate deal score based on price vs market average
            const marketPrice = data.marketData?.averagePrice || guitarData?.avgMarketPrice || listing.price * 1.2;
            const priceDiff = ((marketPrice - listing.price) / marketPrice) * 100;
            const baseScore = Math.max(50, Math.min(95, 75 + priceDiff));
            
            // Add bonus for verified sellers, good condition, etc.
            let dealScore = baseScore;
            if (listing.condition === 'New') dealScore += 5;
            if (listing.condition === 'Excellent') dealScore += 3;
            if (listing.has_real_data) dealScore += 2;
            
            return {
              id: listing.id || `${listing.source}-${listing.price}`,
              price: listing.price,
              marketplace: listing.source,
              sellerLocation: listing.location || 'Location not specified',
              datePosted: listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'Recently',
              listingUrl: listing.listingUrl,
              condition: listing.condition || 'Used',
              dealScore: Math.min(100, Math.floor(dealScore)),
              sellerVerified: listing.has_real_data || false,
              description: listing.description || listing.title || '',
              imageUrl: listing.imageUrl || listing.image_url || listing.photo_url || listing.photos?.[0] || null,
              sellerInfo: {
                name: listing.seller_name || 'Private Seller',
                rating: listing.seller_rating || 0,
                accountAge: listing.seller_account_age || 'Unknown'
              }
            };
          }).filter(Boolean); // Remove null entries
        } else if (data.listings && Array.isArray(data.listings)) {
          // Fallback to original API structure
          console.log('🎸 Processing fallback listings with', data.listings.length, 'listings');
          allListings = data.listings.map((listing: any, index: number) => {
            // Use original field names as fallback
            return {
              id: listing.listing_id || listing.id || `listing-${index}`,
              price: listing.price,
              marketplace: listing.source || listing.marketplace || 'Unknown',
              sellerLocation: listing.seller_location || listing.location || 'Location not specified',
              datePosted: listing.listed_date ? new Date(listing.listed_date).toLocaleDateString() : 'Recently',
              listingUrl: listing.url || listing.listingUrl,
              condition: listing.condition || 'Used',
              dealScore: listing.deal_score || Math.floor(Math.random() * 40 + 60),
              sellerVerified: listing.seller_verified || false,
              description: listing.description || '',
              imageUrl: listing.imageUrl || listing.image_url || listing.photo_url || listing.photos?.[0] || null,
              sellerInfo: {
                name: listing.seller_name || 'Private Seller',
                rating: listing.seller_rating || 0,
                accountAge: listing.seller_account_age_days ? `${Math.floor(listing.seller_account_age_days / 365)} years` : 'Unknown'
              }
            };
          });
        } else {
          console.warn('⚠️ No deals data found in API response. Available keys:', Object.keys(data));
        }
        
        if (allListings.length > 0) {
          console.log('✅ Successfully processed', allListings.length, 'deals');
          // Sort by deal score (highest first) - real scoring
          allListings.sort((a, b) => b.dealScore - a.dealScore);
          
          // Simulate progressive loading with realistic delays
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

            // Progressive reveal of listings
            if (i === 0) {
              setDealListings(allListings.slice(0, Math.min(3, allListings.length)));
            } else if (i === 2) {
              setDealListings(allListings.slice(0, Math.min(6, allListings.length)));
            } else if (i === sources.length - 1) {
              setDealListings(allListings);
            }
            
            await new Promise(resolve => setTimeout(resolve, 250));
          }
        } else {
          console.warn('⚠️ No valid listings found after processing');
          setDealListings([]);
        }
      } else {
        throw new Error(`API request failed: ${response.status}`);
      }

      setScrapingStatus(prev => ({
        ...prev,
        isActive: false,
        lastUpdate: new Date().toLocaleTimeString(),
        nextScan: new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleTimeString()
      }));
      
    } catch (error) {
      console.error('❌ Error loading deals:', error);
      setScrapingStatus(prev => ({ ...prev, isActive: false }));
      // Show some placeholder data for development
      setDealListings([]);
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
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-teal-600 mx-auto mb-4" />
          </motion.div>
          <motion.h2 
            className="text-xl font-semibold text-gray-900 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Loading Guitar Details
          </motion.h2>
          <motion.p 
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Fetching the latest deal information...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  // Error state
  if (error || !guitarData) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          </motion.div>
          <motion.h2 
            className="text-xl font-semibold text-gray-900 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Error Loading Guitar
          </motion.h2>
          <motion.p 
            className="text-gray-600 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {error || 'Guitar not found'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={() => router.push('/')} variant="outline">
              Return to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {guitarData.brand} {guitarData.model}
              </h1>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={scrapingStatus.isActive}
                className="flex items-center gap-2 hover:bg-teal-50 hover:border-teal-300 transition-colors duration-200"
              >
                <RefreshCw className={`w-4 h-4 ${scrapingStatus.isActive ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {scrapingStatus.isActive ? 'Scanning...' : 'Refresh'}
                </span>
              </Button>
            </div>
          </div>
          
        </div>

        {/* Progress Bar - Slides out from underneath navigation */}
        <AnimatePresence>
          {scrapingStatus.isActive && (
            <motion.div 
              className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40"
              style={{ top: '100%' }}
              initial={{ transform: 'translateY(-100%)', opacity: 0 }}
              animate={{ transform: 'translateY(0%)', opacity: 1 }}
              exit={{ transform: 'translateY(-100%)', opacity: 0 }}
              transition={{ 
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Scanning {scrapingStatus.currentSource}...
                  </span>
                  <span>
                    {Math.round(smoothProgress)}%
                  </span>
                </div>
                <Progress value={smoothProgress} className="h-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div 
          className="grid lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Left Column - Guitar Info & Specs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Guitar Image & Basic Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
                    {guitarData.imageUrl ? (
                      <motion.img 
                        src={guitarData.imageUrl} 
                        alt={`${guitarData.brand} ${guitarData.model}`}
                        className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
                              <div class="text-center">
                                <div class="w-16 h-16 mx-auto mb-2 text-teal-400">🎸</div>
                                <p class="text-sm text-teal-600 font-medium">${guitarData.brand}</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-16 h-16 mx-auto mb-2 text-gray-400">🎸</div>
                        <p className="text-sm text-gray-500">No image available</p>
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{guitarData.brand}</h2>
                      <p className="text-lg text-gray-700">{guitarData.model}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{guitarData.type}</Badge>
                      <Badge variant="outline">{guitarData.tier}</Badge>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
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
                      <p className="text-lg font-semibold">${guitarData.msrp?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg. Market</p>
                      <p className="text-lg font-semibold">${guitarData.avgMarketPrice?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {dealListings.length > 0 && (
                      <motion.div 
                        className="pt-3 border-t"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Best Deal Found</span>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">${dealListings[0].price.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">
                              {getPriceChange(dealListings[0].price, guitarData.msrp || guitarData.avgMarketPrice || dealListings[0].price)}% vs MSRP
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Specifications */}
            <AnimatePresence>
              {guitarData.specs && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-3">
                        {[
                          { label: 'Body', value: guitarData.specs.body },
                          { label: 'Neck', value: guitarData.specs.neck },
                          { label: 'Fretboard', value: guitarData.specs.fretboard },
                          { label: 'Pickups', value: guitarData.specs.pickups },
                          { label: 'Scale Length', value: guitarData.specs.scale },
                          { label: 'Frets', value: guitarData.specs.frets.toString() }
                        ].map((spec) => (
                          <div 
                            key={spec.label}
                            className="flex justify-between hover:bg-gray-50 p-2 rounded transition-colors duration-150"
                          >
                            <dt className="text-sm text-gray-600">{spec.label}</dt>
                            <dd className="text-sm font-medium">{spec.value}</dd>
                          </div>
                        ))}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Deal Listings */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
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
                <AnimatePresence mode="wait">
                  {dealsLoading ? (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {[1, 2, 3].map((i) => (
                        <motion.div 
                          key={i}
                          className="animate-pulse"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: (i - 1) * 0.1
                          }}
                        >
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : dealListings.length === 0 ? (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deals Found</h3>
                      <p className="text-gray-600 mb-4">
                        We couldn't find any listings for this guitar right now.
                      </p>
                      <Button onClick={handleManualRefresh} variant="outline">
                        Try Again
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {dealListings.map((deal, index) => (
                        <motion.div 
                          key={deal.id}
                          className="border rounded-lg p-4 hover:shadow-lg hover:border-teal-200 transition-all duration-300 cursor-pointer group"
                          onClick={() => window.open(deal.listingUrl, '_blank')}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.05,
                            ease: [0.25, 0.1, 0.25, 1]
                          }}
                        >
                          <div className="flex items-start gap-4">
                            {/* Thumbnail Image */}
                            <motion.div 
                              className="flex-shrink-0"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4, delay: index * 0.05 + 0.1 }}
                            >
                              {deal.imageUrl ? (
                                <img
                                  src={deal.imageUrl}
                                  alt={`${deal.marketplace} listing`}
                                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                  <Info className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </motion.div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-medium text-gray-500">
                                  #{index + 1}
                                </span>
                                <Badge 
                                  variant="secondary" 
                                  className={`${getScoreColor(deal.dealScore)} transition-colors duration-200`}
                                >
                                  {deal.dealScore}/100 - {getScoreLabel(deal.dealScore)}
                                </Badge>
                                {deal.dealScore >= 85 && (
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                    🔥
                                  </motion.span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xl font-bold text-gray-900">${deal.price.toLocaleString()}</p>
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
                            
                            {/* External Link Icon */}
                            <div className="flex-shrink-0 self-start mt-1 hidden md:block">
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors duration-200" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function GuitarDetailPage() {
  return (
    <Suspense fallback={
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-teal-600 mx-auto mb-4" />
          </motion.div>
          <motion.h2 
            className="text-xl font-semibold text-gray-900 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Loading Guitar Details
          </motion.h2>
          <motion.p 
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Fetching the latest deal information...
          </motion.p>
        </motion.div>
      </motion.div>
    }>
      <GuitarDetailPageContent />
    </Suspense>
  );
} 