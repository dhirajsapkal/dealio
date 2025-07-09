'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { Guitar, Plus, TrendingUp, Clock, DollarSign, X, Trash2 } from 'lucide-react';

// Helper function to get the correct API URL with intelligent environment detection
const getApiUrl = () => {
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default URLs based on environment
  const defaultLocal = 'http://localhost:8000';
  const defaultProduction = 'https://dealio-backend.onrender.com';
  
  // Determine final API URL
  let apiUrl: string;
  
  if (envApiUrl) {
    // Use explicit environment variable if set
    apiUrl = envApiUrl;
  } else if (isDevelopment) {
    // Default to local in development
    apiUrl = defaultLocal;
  } else {
    // Default to production in production
    apiUrl = defaultProduction;
  }
  
  // Enhanced logging for development
  if (isDevelopment) {
    console.log('🔍 Environment Detection:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - NEXT_PUBLIC_API_URL:', envApiUrl || '(not set)');
    console.log('  - Final API URL:', apiUrl);
    console.log('  - Is Local Backend:', apiUrl.includes('localhost'));
  }
  
  return apiUrl;
};

interface TrackedGuitar {
  id: string;
  type: 'Electric' | 'Acoustic' | 'Bass';
  brand: string;
  model: string;
  imageUrl?: string;
  marketPrice?: number;
  bestDealPrice?: number;
  dealsCount?: number;
  lastDeal?: {
    price: number;
    retailer: string;
    date: string;
    dealScore?: number;
  };
  specs?: {
    msrp?: number;
    body?: string;
    neck?: string;
    fretboard?: string;
    pickups?: string;
    type?: string;
    tier?: string;
  };
  createdAt: string;
}

// No fallback brands - always use API data
// Force fresh deployment

export default function Dashboard() {
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [trackedGuitars, setTrackedGuitars] = useState<TrackedGuitar[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guitarToRemove, setGuitarToRemove] = useState<TrackedGuitar | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: ''
  });
  const [brandOptions, setBrandOptions] = useState<Array<{value: string, label: string}>>([]);
  const [modelOptions, setModelOptions] = useState<Array<{value: string, label: string}>>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load tracked guitars from localStorage on component mount
  useEffect(() => {
    const savedGuitars = localStorage.getItem('dealio-tracked-guitars');
    if (savedGuitars) {
      try {
        const parsedGuitars = JSON.parse(savedGuitars);
        setTrackedGuitars(parsedGuitars);
      } catch (error) {
        console.error('Error loading tracked guitars from localStorage:', error);
      }
    }
  }, []);

  // Save tracked guitars to localStorage whenever they change
  useEffect(() => {
    if (trackedGuitars.length > 0) {
      localStorage.setItem('dealio-tracked-guitars', JSON.stringify(trackedGuitars));
    } else {
      localStorage.removeItem('dealio-tracked-guitars');
    }
  }, [trackedGuitars]);

  // Load guitar brands on component mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const apiUrl = getApiUrl();
        const brandsUrl = `${apiUrl}/guitars/brands`;
        console.log('🎸 Loading brands from:', brandsUrl);
        const response = await fetch(brandsUrl);
        console.log('🎸 Brands response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // The API returns a direct array of strings, not an object with a .brands key.
        console.log('🎸 Loaded brands from API:', data);
        const options = data.map((brand: string) => ({
          value: brand,
          label: brand
        }));
        console.log('🎸 Brand options set:', options);
        setBrandOptions(options);
      } catch (error) {
        console.error('🎸 Error loading brands from API:', error);
        setBrandOptions([]); // Show empty instead of fallback
      }
    };
    loadBrands();
  }, []);

  // Load models when brand or type changes
  useEffect(() => {
    const loadModels = async () => {
      if (!formData.brand) {
        setModelOptions([]);
        return;
      }

      setIsLoadingModels(true);
      try {
        const params = new URLSearchParams({
          brand: formData.brand,
          ...(formData.type && { guitar_type: formData.type })
        });
        
        const response = await fetch(`${getApiUrl()}/guitars/models?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🎸 Loaded models from API:', data);
        
        // The API returns a direct array of strings, just like brands
        const models = Array.isArray(data) ? data : [];
        
        const options = models.map((model: string) => ({
          value: model,
          label: model
        }));
        
        console.log('🎸 Model options set:', options);
        setModelOptions(options);
      } catch (error) {
        console.error('🎸 Error loading models:', error);
        setModelOptions([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, [formData.brand, formData.type]);

  // Test API connectivity
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const apiUrl = getApiUrl();
        console.log('🔍 Testing connection to:', `${apiUrl}/health`);
        const response = await fetch(`${apiUrl}/health`);
        console.log('🔍 Health check response status:', response.status);
        const data = await response.json();
        console.log('🔍 Health check response data:', data);
        setApiStatus(data.status === 'ok' ? 'Connected' : 'Error');
      } catch (error) {
        console.error('🔍 Health check failed:', error);
        setApiStatus('Offline');
      }
    };
    testApiConnection();
  }, []);



  const fetchGuitarMarketData = async (brand: string, model: string) => {
    const response = await fetch(`${getApiUrl()}/guitars/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch guitar data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🎸 API Response for guitar data:', data);
    
    // Check for the correct API response structure
    if (!data.guitarData || !data.marketData) {
      throw new Error('API response missing required guitar or market data');
    }
    
    return {
      marketPrice: data.marketData.averagePrice || 0,
      dealsCount: data.marketData.listingCount || 0,
      bestDealPrice: data.deals?.all?.[0]?.price || null,
      imageUrl: data.guitarData.imageUrl || null,
      specs: data.guitarData.specs || null
    };
  };

  const handleAddGuitar = async () => {
    if (formData.type && formData.brand && formData.model) {
      try {
        const marketData = await fetchGuitarMarketData(formData.brand, formData.model);

      const newGuitar: TrackedGuitar = {
        id: Math.random().toString(36).substr(2, 9),
        type: formData.type as 'Electric' | 'Acoustic' | 'Bass',
        brand: formData.brand,
        model: formData.model,
        createdAt: new Date().toISOString(),
        ...marketData
      };
      
      setTrackedGuitars([...trackedGuitars, newGuitar]);
      setFormData({ type: '', brand: '', model: '' });
      setIsAddModalOpen(false);
      } catch (error) {
        console.error('Failed to add guitar:', error);
        // TODO: Show error message to user
      }
    }
  };

  const handleRemoveGuitar = (guitar: TrackedGuitar) => {
    setGuitarToRemove(guitar);
  };

  const confirmRemoveGuitar = () => {
    if (guitarToRemove) {
      setTrackedGuitars(trackedGuitars.filter(guitar => guitar.id !== guitarToRemove.id));
      setGuitarToRemove(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-teal-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Dealio</h1>
              <Badge variant="secondary" className="text-xs">
                {apiStatus}
              </Badge>
            </div>



            {/* User Profile Placeholder */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {trackedGuitars.length === 0 ? 'Guitar Deal Tracker' : `Tracked Guitars (${trackedGuitars.length})`}
          </h2>
          <p className="text-gray-600">
            {trackedGuitars.length === 0 
              ? 'Start tracking deals and price history for your favorite guitars' 
              : 'Monitor deals and price changes for your favorite guitars'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* CTA Card - Always First */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Card className="border-2 border-dashed border-teal-300 hover:border-teal-400 transition-colors duration-200 cursor-pointer bg-teal-50/50 hover:bg-teal-50 h-full">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center min-h-[420px]">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Track New Guitar
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {trackedGuitars.length === 0 
                      ? 'Start monitoring deals and price history across online marketplaces'
                      : 'Add another guitar to track deals and price history'
                    }
                  </p>
                  <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-100">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="
              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
              w-[calc(100vw-20px)] h-[calc(100vh-20px)] max-w-[calc(100vw-20px)] max-h-[calc(100vh-20px)]
              sm:w-[85vw] sm:max-w-lg sm:h-auto sm:max-h-[calc(100vh-2rem)]
              overflow-y-auto flex flex-col
            ">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <Guitar className="w-5 h-5 text-teal-600" />
                  Track New Guitar
                </DialogTitle>
                <DialogDescription>
                  Find the best deals for your guitar across online marketplaces. We&apos;ll track prices and notify you of great deals.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4 min-h-[400px] flex-1 overflow-y-auto">
                {/* Step 1: Guitar Type */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-medium flex items-center justify-center">1</div>
                    <label className="text-sm font-medium">What type of guitar?</label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Electric', 'Acoustic', 'Bass'].map((type) => (
                      <motion.div
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Button
                          variant={formData.type === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, type })}
                          className={`w-full h-8 ${formData.type === type ? 'bg-teal-600 hover:bg-teal-700' : 'hover:bg-teal-50 hover:border-teal-200'}`}
                        >
                          {type}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Brand */}
                <div className="space-y-3 min-h-[120px]">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full text-sm font-medium flex items-center justify-center ${
                      formData.type ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'
                    }`}>2</div>
                    <label className="text-sm font-medium">Which brand?</label>
                  </div>
                  <div className="space-y-1">
                    <div className="min-h-[40px] flex items-center">
                      {brandOptions.length === 0 ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md w-full">
                          <p className="text-sm text-amber-700">Loading brands from database...</p>
                        </div>
                      ) : (
                        <Combobox
                          key={`brand-${brandOptions.length}`}
                          options={brandOptions}
                          value={formData.brand}
                          onValueChange={(value) => setFormData({...formData, brand: value, model: ''})}
                          placeholder="Type to search brands (e.g., Fender, Gibson, Schecter)..."
                          disabled={!formData.type}
                          className="w-full"
                        />
                      )}
                    </div>
                    <div className="min-h-[20px]">
                      {formData.type && brandOptions.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {brandOptions.length} brands available • Type to search
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Model */}
                <div className="space-y-3 min-h-[120px]">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full text-sm font-medium flex items-center justify-center ${
                      formData.brand ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'
                    }`}>3</div>
                    <label className="text-sm font-medium">What model?</label>
                  </div>
                  <div className="space-y-1">
                    <div className="min-h-[40px] flex items-center">
                      {isLoadingModels ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md w-full">
                          <p className="text-sm text-blue-700">Loading {formData.brand} models...</p>
                        </div>
                      ) : (
                        <Combobox
                          options={modelOptions}
                          value={formData.model}
                          onValueChange={(value) => setFormData({...formData, model: value})}
                          placeholder={
                            !formData.brand 
                              ? "Select a brand first..." 
                              : modelOptions.length > 0
                                ? "Type to search models..."
                                : "Type any model name..."
                          }
                          disabled={!formData.brand || isLoadingModels}
                          className="w-full"
                        />
                      )}
                    </div>
                    <div className="min-h-[20px]">
                      {formData.brand && !isLoadingModels && (
                        <p className="text-xs text-gray-500">
                          {modelOptions.length > 0 
                            ? `${modelOptions.length} models found • You can also type a custom model name`
                            : "No predefined models found • Type any model name"
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2 flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button 
                    onClick={handleAddGuitar}
                    className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
                    disabled={!formData.type || !formData.brand || !formData.model}
                  >
                    <Plus className="w-4 h-4" />
                    Start Tracking
                  </Button>
                </motion.div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Tracked Guitar Cards */}
          {trackedGuitars.map((guitar, index) => {
            const hasDeals = guitar.dealsCount && guitar.dealsCount > 0;
            const hasGoodDeal = guitar.marketPrice && guitar.bestDealPrice && guitar.bestDealPrice < guitar.marketPrice * 0.9;
            const savingsAmount = guitar.marketPrice && guitar.bestDealPrice ? guitar.marketPrice - guitar.bestDealPrice : 0;
            const savingsPercent = guitar.marketPrice && guitar.bestDealPrice ? ((guitar.marketPrice - guitar.bestDealPrice) / guitar.marketPrice) * 100 : 0;
            const msrp = guitar.specs?.msrp || (guitar.marketPrice ? guitar.marketPrice * 1.3 : null);
            
            return (
              <motion.div
                key={guitar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 relative group border-0 shadow-md hover:shadow-2xl">
                {/* Deal Status Indicator */}
                {hasGoodDeal && (
                  <div className="absolute -top-2 -right-2 z-20">
                    <Badge className="bg-red-500 text-white shadow-lg animate-pulse">
                      🔥 Great Deal!
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveGuitar(guitar)}
                    title="Remove guitar from tracking"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {/* Enhanced Image with Loading State */}
                  <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 overflow-hidden relative">
                    {guitar.imageUrl ? (
                      <img 
                        src={guitar.imageUrl} 
                        alt={`${guitar.brand} ${guitar.model}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
                              <div class="text-center">
                                <svg class="w-12 h-12 text-teal-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                                </svg>
                                <p class="text-xs text-teal-600 font-medium">${guitar.brand}</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
                        <div className="text-center">
                          <Guitar className="w-12 h-12 text-teal-400 mx-auto mb-2" />
                          <p className="text-xs text-teal-600 font-medium">{guitar.brand}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Deal Count Overlay */}
                    {hasDeals && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                          {guitar.dealsCount} deals
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight">{guitar.brand} {guitar.model}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {guitar.type}
                      </Badge>
                      {guitar.specs?.tier && (
                        <Badge variant="outline" className="text-xs">
                          {guitar.specs.tier}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-3">
                  {/* Price Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {/* MSRP vs Market */}
                    {msrp && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">MSRP:</span>
                        <span className="text-gray-400 line-through">${msrp.toFixed(0)}</span>
                      </div>
                    )}
                    
                    {/* Market Price */}
                    {guitar.marketPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Avg Market:</span>
                        <span className="font-semibold text-gray-900">${guitar.marketPrice.toFixed(0)}</span>
                      </div>
                    )}
                    
                    {/* Best Deal */}
                    {guitar.bestDealPrice ? (
                      <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-2">
                        <span className="text-green-700 font-medium">Best Deal:</span>
                        <span className="font-bold text-green-700 text-lg">${guitar.bestDealPrice.toFixed(0)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 border-t border-gray-200 pt-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Finding deals...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Savings Highlight */}
                  {hasGoodDeal && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-700">
                          ${savingsAmount.toFixed(0)} saved
                        </div>
                        <div className="text-xs text-green-600">
                          {savingsPercent.toFixed(0)}% below market • Excellent deal!
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Last Updated */}
                  <div className="text-xs text-gray-400 text-center">
                    Added {new Date(guitar.createdAt).toLocaleDateString()}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      onClick={() => {
                        const params = new URLSearchParams({
                          brand: guitar.brand,
                          model: guitar.model,
                          type: guitar.type
                        });
                        router.push(`/guitars/guitar-id?${params.toString()}`);
                      }}
                    >
                      {hasGoodDeal ? '🔥 View Deal' : 'View Details'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveGuitar(guitar)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      title="Remove from tracking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            )
          })}
        </div>
      </main>

      {/* Remove Guitar Confirmation Dialog */}
      <AlertDialog open={!!guitarToRemove} onOpenChange={() => setGuitarToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Guitar from Tracking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop tracking the{' '}
              <span className="font-semibold">
                {guitarToRemove?.brand} {guitarToRemove?.model}
              </span>?{' '}
              This action cannot be undone and you'll lose all tracking history for this guitar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveGuitar}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Guitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
