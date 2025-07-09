'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Import all detail components
import GuitarDetailOverview from '@/components/guitar-detail/GuitarDetailOverview';
import BestDealCard from '@/components/guitar-detail/BestDealCard';
import DealScoreVisualization from '@/components/guitar-detail/DealScoreVisualization';
import DealAnalysisAccordion from '@/components/guitar-detail/DealAnalysisAccordion';
import AlternativeDealsList from '@/components/guitar-detail/AlternativeDealsList';

interface GuitarData {
  id: string;
  brand: string;
  model: string;
  type: 'Electric' | 'Acoustic' | 'Bass';
  avgMarketPrice: number;
  imageUrl?: string;
  yearManufactured?: number;
  description?: string;
}

interface DealListing {
  id: string;
  price: number;
  originalPrice?: number;
  marketplace: string;
  sellerLocation: string;
  datePosted: string;
  listingUrl: string;
  condition: string;
  score?: number;
  sellerVerified: boolean;
  sellerInfo?: {
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

/**
 * Guitar Detail Page
 * Comprehensive view of a single tracked guitar with deal analysis and marketplace listings
 */
export default function GuitarDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get guitar info from URL params or localStorage
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
  const [marketDataLoading, setMarketDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadType, setImageUploadType] = useState<'url' | 'file'>('url');
  const [imageUrl, setImageUrl] = useState('');

  // Load guitar data on component mount
  useEffect(() => {
    const loadGuitarData = async () => {
      try {
        // Get guitar info from search params or localStorage
        const brand = searchParams.get('brand');
        const model = searchParams.get('model');
        const type = searchParams.get('type') || 'Electric';
        
        if (!brand || !model) {
          // Try to get from localStorage (fallback from dashboard)
          const storedGuitars = localStorage.getItem('dealio-tracked-guitars');
          if (storedGuitars) {
            const guitars = JSON.parse(storedGuitars);
            const guitar = guitars[0]; // Use first guitar as fallback
            if (guitar) {
              const guitarData = {
                id: guitar.id,
                brand: guitar.brand,
                model: guitar.model,
                type: guitar.type,
                avgMarketPrice: guitar.marketPrice || 900,
                imageUrl: guitar.imageUrl
              };
              setGuitarData(guitarData);
              setLoading(false); // Show page immediately
              
              // Load deals in background
              loadDealsData(guitar.brand, guitar.model);
              return;
            }
          }
          setError('Guitar information not found. Please select a guitar from the dashboard.');
          setLoading(false);
          return;
        }

        // Create guitar data from URL params - show immediately
        const guitar: GuitarData = {
          id: `${brand.toLowerCase()}-${model.toLowerCase()}`,
          brand,
          model,
          type: type as 'Electric' | 'Acoustic' | 'Bass',
          avgMarketPrice: 900, // Will be updated from API
        };

        setGuitarData(guitar);
        setLoading(false); // Show page immediately with skeleton loaders
        
        // Load deals and image in background
        loadDealsData(brand, model);
        fetchGuitarImage(brand, model);
        
      } catch (error) {
        console.error('Error loading guitar data:', error);
        setError('Failed to load guitar information.');
        setLoading(false);
      }
    };

    loadGuitarData();
  }, [searchParams]);

  // Fetch guitar image from various sources
  const fetchGuitarImage = async (brand: string, model: string) => {
    try {
      // First try to get image from Unsplash
      const query = encodeURIComponent(`${brand} ${model} guitar`);
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=YOUR_UNSPLASH_ACCESS_KEY`
      );
      
      if (unsplashResponse.ok) {
        const data = await unsplashResponse.json();
        if (data.results && data.results.length > 0) {
          const imageUrl = data.results[0].urls.regular;
          setGuitarData(prev => prev ? { ...prev, imageUrl } : null);
          return;
        }
      }

      // Fallback: Try to construct a generic guitar image URL
      const genericImageUrl = `https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=400&h=400&fit=crop&crop=center`;
      setGuitarData(prev => prev ? { 
        ...prev, 
        imageUrl: genericImageUrl 
      } : null);
      
    } catch (error) {
      console.log('Could not fetch guitar image:', error);
      // If all fails, don't set an image - will show upload option
    }
  };

  // Save custom image
  const saveCustomImage = async (imageUrl: string) => {
    try {
      setGuitarData(prev => prev ? { ...prev, imageUrl } : null);
      setShowImageUpload(false);
      setImageUrl('');
    } catch (error) {
      console.error('Error saving custom image:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          saveCustomImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Load deals data progressively from backend
  const loadDealsData = async (brand: string, model: string) => {
    try {
      setDealsLoading(true);
      setScrapingStatus(prev => ({ ...prev, isActive: true, progress: 0, currentSource: 'Initializing...' }));
      
      // Start API call immediately
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guitars/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update market price immediately
        setGuitarData(prev => prev ? {
          ...prev,
          avgMarketPrice: data.market_price || 600
        } : null);
        setMarketDataLoading(false);
        
        // Get all listings
        const allListings: DealListing[] = data.listings?.map((listing: any, index: number) => ({
          id: listing.listing_id || `deal-${index}`,
          price: listing.price,
          marketplace: listing.source,
          sellerLocation: listing.seller_location || 'Unknown',
          datePosted: listing.listed_date ? new Date(listing.listed_date).toLocaleDateString() : 'Recently',
          listingUrl: listing.url || '#',
          condition: listing.condition || 'Good',
          score: listing.deal_score || 50,
          sellerVerified: listing.seller_verified || false,
          sellerInfo: {
            name: listing.seller_name || 'Unknown Seller',
            rating: listing.seller_rating || 0,
            accountAge: listing.seller_account_age_days ? `${Math.floor(listing.seller_account_age_days / 365)} years` : 'Unknown'
          }
        })) || [];
        
        // Simulate progressive loading for better UX
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

          // Add deals progressively by source
          const sourceDeals = allListings.filter(listing => 
            listing.marketplace.toLowerCase().includes(source.toLowerCase()) ||
            (source === 'Guitar Center' && listing.marketplace === 'Guitar Center') ||
            (source === 'Facebook' && listing.marketplace === 'Facebook') ||
            (i === sources.length - 1) // Add remaining deals on last iteration
          );

          if (i === 0 || sourceDeals.length > 0) {
            // On first iteration, show a preview deal, then add progressively
            setDealListings(prev => {
              const newDeals = i === 0 ? allListings.slice(0, 1) : [...prev, ...sourceDeals];
              return newDeals.filter((deal, index, self) => 
                index === self.findIndex(d => d.id === deal.id)
              );
            });
          }
          
          // Realistic delay for each source
          await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
        }

        // Ensure all deals are loaded
        setDealListings(allListings);
        
        // Store deal categories for enhanced display
        if (data.deal_categories) {
          (window as any).dealCategories = data.deal_categories;
          (window as any).modelVariants = data.model_variants;
        }
      } else {
        // Fallback demo data
        const demoDeals = [
          {
            id: 'demo-deal-1',
            price: 649,
            marketplace: 'Reverb',
            sellerLocation: 'Austin, TX',
            datePosted: '2 days ago',
            listingUrl: 'https://reverb.com/marketplace?query=Epiphone+Les+Paul',
            condition: 'Excellent',
            score: 87,
            sellerVerified: true,
            sellerInfo: {
              name: 'MusicStoreAustin',
              rating: 4.8,
              accountAge: '3 years'
            }
          }
        ];
        setDealListings(demoDeals);
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

  // Auto-refresh deals every 6 hours
  useEffect(() => {
    if (!guitarData) return;

    const interval = setInterval(() => {
      if (!scrapingStatus.isActive) {
        loadDealsData(guitarData.brand, guitarData.model);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    return () => clearInterval(interval);
  }, [guitarData, scrapingStatus.isActive]);

  // Manual refresh function
  const handleManualRefresh = () => {
    if (guitarData && !scrapingStatus.isActive) {
      loadDealsData(guitarData.brand, guitarData.model);
    }
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

  const bestDeal = dealListings.length > 0 ? dealListings[0] : null;

  // Skeleton Loader Components
  const DealCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const DealRowSkeleton = () => (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="space-y-1">
              <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
              <div className="flex flex-wrap gap-4">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-48">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="lg:w-40">
          <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Deal Card Component for featured deals
  const DealCard = ({ deal, guitarData, title, subtitle, className = '' }: {
    deal: DealListing;
    guitarData: GuitarData;
    title: string;
    subtitle: string;
    className?: string;
  }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <Badge className="bg-green-100 text-green-800 font-semibold">
            ${(guitarData.avgMarketPrice - deal.price).toFixed(0)} saved
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Price and Model */}
          <div>
            <div className="text-3xl font-bold text-green-600">${deal.price}</div>
            <div className="text-sm text-gray-600">
              {((guitarData.avgMarketPrice - deal.price) / guitarData.avgMarketPrice * 100).toFixed(0)}% below market • {deal.condition}
            </div>
          </div>

          {/* Deal Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Source:</span>
              <span className="font-medium ml-1">{deal.marketplace}</span>
            </div>
            <div>
              <span className="text-gray-600">Score:</span>
              <span className="font-medium ml-1">{deal.score}/100</span>
            </div>
            <div>
              <span className="text-gray-600">Seller:</span>
              <span className="font-medium ml-1">{deal.sellerInfo?.rating}/5.0</span>
            </div>
            <div>
              <span className="text-gray-600">Posted:</span>
              <span className="font-medium ml-1">{deal.datePosted}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full bg-teal-600 hover:bg-teal-700"
            onClick={() => {
              if (deal.listingUrl && deal.listingUrl !== '#') {
                window.open(deal.listingUrl, '_blank', 'noopener,noreferrer');
              } else {
                const searchQuery = encodeURIComponent(`${guitarData.brand} ${guitarData.model} ${deal.condition}`);
                const searchUrls = {
                  'Reverb': `https://reverb.com/marketplace?query=${searchQuery}`,
                  'eBay': `https://www.ebay.com/sch/i.html?_nkw=${searchQuery}`,
                  'Facebook': `https://www.facebook.com/marketplace/search/?query=${searchQuery}`,
                  'Craigslist': `https://craigslist.org/search/msg?query=${searchQuery}`,
                  'Guitar Center': `https://www.guitarcenter.com/search?query=${searchQuery}`,
                  'Sweetwater': `https://www.sweetwater.com/search?s=${searchQuery}`
                };
                const searchUrl = searchUrls[deal.marketplace as keyof typeof searchUrls] || `https://google.com/search?q=${searchQuery}`;
                window.open(searchUrl, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            View Listing →
          </Button>
        </div>
      </div>
    </div>
  );

  // Enhanced Deal Row Component for detailed listing display
  const DealRowCard = ({ deal, guitarData, rank }: {
    deal: DealListing;
    guitarData: GuitarData;
    rank: number;
  }) => (
    <div 
      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
      onClick={() => {
        if (deal.listingUrl && deal.listingUrl !== '#') {
          window.open(deal.listingUrl, '_blank', 'noopener,noreferrer');
        } else {
          const searchQuery = encodeURIComponent(`${guitarData.brand} ${guitarData.model} ${deal.condition}`);
          const searchUrls = {
            'Reverb': `https://reverb.com/marketplace?query=${searchQuery}`,
            'eBay': `https://www.ebay.com/sch/i.html?_nkw=${searchQuery}`,
            'Facebook': `https://www.facebook.com/marketplace/search/?query=${searchQuery}`,
            'Craigslist': `https://craigslist.org/search/msg?query=${searchQuery}`,
            'Guitar Center': `https://www.guitarcenter.com/search?Ntt=${searchQuery}`,
            'Sweetwater': `https://www.sweetwater.com/search?s=${searchQuery}`
          };
          const searchUrl = searchUrls[deal.marketplace as keyof typeof searchUrls] || `https://google.com/search?q=${searchQuery}`;
          window.open(searchUrl, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Section - Basic Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            #{rank}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-bold text-gray-900">${deal.price}</div>
              <Badge variant={deal.score && deal.score > 80 ? "default" : "secondary"} className="text-xs">
                {((guitarData.avgMarketPrice - deal.price) / guitarData.avgMarketPrice * 100).toFixed(0)}% off
              </Badge>
              <Badge variant="outline" className="text-xs">
                Score: {deal.score}/100
              </Badge>
            </div>
            
            {/* Model Name and Description */}
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900 text-lg">
                {(deal as any).specific_model || `${deal.marketplace} ${guitarData.model}`}
              </h4>
              
                             {(deal as any).review_summary && (
                 <p 
                   className="text-sm text-gray-600"
                   style={{
                     display: '-webkit-box',
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: 'vertical',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis'
                   }}
                 >
                   {(deal as any).review_summary}
                 </p>
               )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span><strong>Source:</strong> {deal.marketplace}</span>
                <span><strong>Condition:</strong> {deal.condition}</span>
                <span><strong>Location:</strong> {deal.sellerLocation}</span>
                <span><strong>Posted:</strong> {deal.datePosted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Seller Info */}
        <div className="lg:w-48 space-y-2">
          <div className="text-sm">
            <div className="font-medium text-gray-900">{deal.sellerInfo?.name || 'Unknown Seller'}</div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Rating:</span>
              <span className="font-medium">{deal.sellerInfo?.rating || 'N/A'}/5.0</span>
              {deal.sellerVerified && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  ✓ Verified
                </Badge>
              )}
            </div>
            {(deal as any).seller_reviews_count && (
              <div className="text-xs text-gray-500">
                {(deal as any).seller_reviews_count} reviews
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Action & Details */}
        <div className="lg:w-40 text-right space-y-2">
          <Button 
            size="sm" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              if (deal.listingUrl && deal.listingUrl !== '#') {
                window.open(deal.listingUrl, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            View Listing →
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            {(deal as any).listing_photos && (
              <div>{(deal as any).listing_photos} photos</div>
            )}
            {(deal as any).shipping_cost !== undefined && (
              <div>
                {(deal as any).shipping_cost === 0 ? 'Free shipping' : `+$${(deal as any).shipping_cost} shipping`}
              </div>
            )}
            {(deal as any).warranty && (
              <div className="text-green-600 font-medium">{(deal as any).warranty} warranty</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                {guitarData.brand} {guitarData.model} - Deal Analysis
              </h1>
            </div>
            
            {/* Refresh Button and Status */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={scrapingStatus.isActive}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${scrapingStatus.isActive ? 'animate-spin' : ''}`} />
                {scrapingStatus.isActive ? 'Scanning...' : 'Refresh Deals'}
              </Button>
              
              <Badge variant={scrapingStatus.isActive ? "default" : "secondary"}>
                {scrapingStatus.isActive ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Live Scanning
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Updated {scrapingStatus.lastUpdate}
                  </div>
                )}
              </Badge>
            </div>
          </div>
          
          {/* Scraping Progress Bar */}
          {scrapingStatus.isActive && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Scanning {scrapingStatus.currentSource}...</span>
                <span>{Math.round(scrapingStatus.progress)}% Complete</span>
              </div>
              <Progress value={scrapingStatus.progress} className="h-2" />
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>Completed:</span>
                {scrapingStatus.completedSources.map((source, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs py-0 px-1">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Guitar Overview */}
        <GuitarDetailOverview 
          guitar={guitarData} 
          marketDataLoading={marketDataLoading}
          onImageUpdate={(newImageUrl) => {
            setGuitarData(prev => prev ? { ...prev, imageUrl: newImageUrl } : null);
          }}
        />

        {/* Loading Status Card */}
        {dealsLoading && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              <div>
                <h3 className="font-semibold text-gray-900">Loading Deals</h3>
                <p className="text-sm text-gray-600">
                  Fetching the latest listings from multiple marketplaces...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scraping Status Card */}
        {!scrapingStatus.isActive && !dealsLoading && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Deal Scan Complete</h3>
                  <p className="text-sm text-gray-600">
                    Found {dealListings.length} active listing{dealListings.length !== 1 ? 's' : ''} • 
                    Last updated {scrapingStatus.lastUpdate} • 
                    Next scan at {scrapingStatus.nextScan}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {dealListings.length} Deals Found
                </div>
                <div className="text-sm text-gray-600">
                  Across {scrapingStatus.completedSources.length} platforms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Deal Categories */}
        <div className="mb-6 space-y-6">
          {/* Deal Categories Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Best Value Deal */}
            {dealListings.length > 0 ? (
              <DealCard 
                deal={dealListings[0]}
                guitarData={guitarData}
                title="🎯 Best Value"
                subtitle="Top-rated for overall value"
                className="border-l-4 border-l-green-500"
              />
            ) : dealsLoading ? (
              <DealCardSkeleton />
            ) : null}
            
            {/* Premium Deal */}
            {dealListings.length > 1 ? (
              <DealCard 
                deal={dealListings[1]}
                guitarData={guitarData}
                title="✨ Premium Choice"
                subtitle="Higher-end model at great price"
                className="border-l-4 border-l-purple-500"
              />
            ) : dealsLoading ? (
              <DealCardSkeleton />
            ) : null}
          </div>

          {/* All Marketplace Listings - Enhanced Detail */}
          {(dealListings.length > 2 || dealsLoading) && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Complete Marketplace Listings</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {dealsLoading 
                        ? 'Loading detailed listings from all marketplaces...'
                        : 'Detailed listings with seller info, descriptions, and direct links • Click any listing to visit the original page'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    {dealsLoading ? (
                      <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-blue-600">{Math.max(0, dealListings.length - 2)}</div>
                        <div className="text-xs text-gray-500">more listings</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {dealListings.length > 2 ? (
                  dealListings.slice(2).map((deal, index) => (
                    <DealRowCard 
                      key={deal.id}
                      deal={deal}
                      guitarData={guitarData}
                      rank={index + 3}
                    />
                  ))
                ) : dealsLoading ? (
                  // Show skeleton loaders while loading
                  Array.from({ length: 3 }).map((_, index) => (
                    <DealRowSkeleton key={`skeleton-${index}`} />
                  ))
                ) : null}
              </div>
            </div>
          )}
        </div>



        {/* No Deals Found */}
        {dealListings.length === 0 && !dealsLoading && !scrapingStatus.isActive && (
          <div className="mb-6 bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deals Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any active listings for this guitar model right now. 
              This could mean it's a rare or discontinued model, or there simply aren't any available.
            </p>
            <Button 
              variant="outline" 
              onClick={handleManualRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Scanning Again
            </Button>
          </div>
        )}

        {/* Footer Action */}
        <div className="text-center py-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Deal Alert Settings
            </h3>
            <p className="text-gray-600 mb-4">
              Get notified when better deals become available for this guitar
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline">
                Set Price Alert (${Math.round(guitarData.avgMarketPrice * 0.7)} or less)
              </Button>
              <Button className="bg-teal-600 hover:bg-teal-700">
                Enable Deal Notifications
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 