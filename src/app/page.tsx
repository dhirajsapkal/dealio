'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { Search, Guitar, Plus, TrendingUp, Clock, DollarSign, X, Trash2 } from 'lucide-react';

// Helper function to get the correct API URL
const getApiUrl = () => {
  // Use local backend for development testing
  return 'http://localhost:8000';
  
  // Alternative: Use environment variable with local fallback
  // return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
        const response = await fetch(`${getApiUrl()}/guitars/brands`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('🎸 Loaded brands from API:', data.brands);
        console.log('🎸 Looking for Schecter:', data.brands.filter((b: string) => b.toLowerCase().includes('sch')));
        const options = data.brands.map((brand: string) => ({
          value: brand,
          label: brand
        }));
        console.log('🎸 Brand options set:', options.filter((opt: any) => opt.label.toLowerCase().includes('sch')));
        setBrandOptions(options);
      } catch (error) {
        console.error('Error loading brands from API:', error);
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
        const data = await response.json();
        
        let models = data.models || [];
        
        // If we have models by type and a type is selected, use those
        if (data.models_by_type && formData.type && data.models_by_type[formData.type]) {
          models = data.models_by_type[formData.type];
        }
        
        const options = models.map((model: string) => ({
          value: model,
          label: model
        }));
        
        setModelOptions(options);
      } catch (error) {
        console.error('Error loading models:', error);
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
        const response = await fetch(`${getApiUrl()}/health`);
        const data = await response.json();
        setApiStatus(data.status === 'ok' ? 'Connected' : 'Error');
      } catch (error) {
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
    
    // Require complete data from API
    if (!data.market_price || !data.guitar_image || !data.guitar_specs) {
      throw new Error('API must provide complete guitar data including image and specs');
    }
    
        return {
          marketPrice: data.market_price,
      dealsCount: data.listing_count || data.count,
      bestDealPrice: data.listings?.[0]?.price,
      imageUrl: data.guitar_image,
      specs: data.guitar_specs
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

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search guitars, brands, or models..."
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
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
              <Card className="border-2 border-dashed border-teal-300 hover:border-teal-400 transition-colors duration-200 cursor-pointer bg-teal-50/50 hover:bg-teal-50">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center min-h-[280px]">
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
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Guitar className="w-5 h-5 text-teal-600" />
                  Track New Guitar
                </DialogTitle>
                <DialogDescription>
                  Find the best deals for your guitar across online marketplaces. We&apos;ll track prices and notify you of great deals.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Step 1: Guitar Type */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-medium flex items-center justify-center">1</div>
                    <label className="text-sm font-medium">What type of guitar?</label>
                  </div>
                  <div className="grid grid-cols-3 gap-2 ml-8">
                    {['Electric', 'Acoustic', 'Bass'].map((type) => (
                      <Button
                        key={type}
                        variant={formData.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, type })}
                        className={formData.type === type ? 'bg-teal-600 hover:bg-teal-700' : 'hover:bg-teal-50 hover:border-teal-200'}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Brand */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full text-sm font-medium flex items-center justify-center ${
                      formData.type ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'
                    }`}>2</div>
                    <label className="text-sm font-medium">Which brand?</label>
                  </div>
                  <div className="ml-8">
                    {brandOptions.length === 0 ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
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
                  />
                    )}
                    {formData.type && brandOptions.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {brandOptions.length} brands available • Type to search
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 3: Model */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full text-sm font-medium flex items-center justify-center ${
                      formData.brand ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'
                    }`}>3</div>
                    <label className="text-sm font-medium">What model?</label>
                  </div>
                  <div className="ml-8">
                    {isLoadingModels ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
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
                  />
                    )}
                    {formData.brand && !isLoadingModels && (
                    <p className="text-xs text-gray-500 mt-1">
                        {modelOptions.length > 0 
                          ? `${modelOptions.length} models found • You can also type a custom model name`
                          : "No predefined models found • Type any model name"
                        }
                    </p>
                  )}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddGuitar}
                  className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
                  disabled={!formData.type || !formData.brand || !formData.model}
                >
                  <Plus className="w-4 h-4" />
                  Start Tracking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Tracked Guitar Cards */}
          {trackedGuitars.map((guitar) => (
            <Card key={guitar.id} className="hover:shadow-lg transition-shadow duration-200 relative">
              <CardHeader className="pb-3">
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 z-10"
                  onClick={() => handleRemoveGuitar(guitar)}
                  title="Remove guitar from tracking"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                  {guitar.imageUrl ? (
                    <img 
                      src={guitar.imageUrl} 
                      alt={`${guitar.brand} ${guitar.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to guitar icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Guitar className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{guitar.brand} {guitar.model}</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {guitar.type}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Market Price Info */}
                  {guitar.marketPrice && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Market Price:</span>
                      <span className="font-semibold text-gray-900">${guitar.marketPrice}</span>
                    </div>
                  )}
                  
                  {/* Best Deal Info */}
                  {guitar.bestDealPrice ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Best Deal:</span>
                      <span className="font-semibold text-green-600">${guitar.bestDealPrice}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Searching for deals...</span>
                    </div>
                  )}
                  
                  {/* Deal Count */}
                  {guitar.dealsCount !== undefined && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{guitar.dealsCount} deals found</span>
                    </div>
                  )}
                  
                  {/* Savings Badge */}
                  {guitar.marketPrice && guitar.bestDealPrice && guitar.marketPrice > guitar.bestDealPrice && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-700">
                          ${(guitar.marketPrice - guitar.bestDealPrice).toFixed(0)} saved
                        </div>
                        <div className="text-xs text-green-600">
                          {Math.round(((guitar.marketPrice - guitar.bestDealPrice) / guitar.marketPrice) * 100)}% off market price
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
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
                      View Details
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
                </div>
              </CardContent>
            </Card>
          ))}
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
