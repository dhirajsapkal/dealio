import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Guitar, Star, Clock, Upload, Link, Camera } from 'lucide-react';

interface GuitarDetailOverviewProps {
  guitar: {
    id: string;
    brand: string;
    model: string;
    type: 'Electric' | 'Acoustic' | 'Bass';
    avgMarketPrice: number;
    imageUrl?: string;
    yearManufactured?: number;
    description?: string;
  };
  onImageUpdate?: (imageUrl: string) => void;
  marketDataLoading?: boolean;
}

/**
 * Guitar Detail Overview Component
 * Displays the main guitar information including image, brand, model, type and market price
 */
export default function GuitarDetailOverview({ guitar, onImageUpdate, marketDataLoading = false }: GuitarDetailOverviewProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadType, setImageUploadType] = useState<'url' | 'file'>('url');
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim() && onImageUpdate) {
      onImageUpdate(imageUrl.trim());
      setShowImageUpload(false);
      setImageUrl('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpdate) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onImageUpdate(result);
          setShowImageUpload(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Guitar Image */}
          <div className="flex-shrink-0">
            <div className="w-full md:w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
              {guitar.imageUrl ? (
                <img 
                  src={guitar.imageUrl} 
                  alt={`${guitar.brand} ${guitar.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Guitar className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No image available</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              
              {/* Image Upload Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageUpload(true)}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {guitar.imageUrl ? 'Change Image' : 'Add Image'}
                </Button>
              </div>
            </div>

            {/* Image Upload Modal */}
            {showImageUpload && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Add Guitar Image</h3>
                  
                  {/* Upload Type Selector */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={imageUploadType === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageUploadType('url')}
                      className="flex-1"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      URL
                    </Button>
                    <Button
                      variant={imageUploadType === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageUploadType('file')}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>

                  {imageUploadType === 'url' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL
                        </label>
                        <Input
                          type="url"
                          placeholder="https://example.com/guitar-image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleImageUrlSubmit} className="flex-1">
                          Add Image
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowImageUpload(false);
                            setImageUrl('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Image File
                        </label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowImageUpload(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Guitar Information */}
          <div className="flex-1 space-y-4">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {guitar.brand} {guitar.model}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {guitar.type}
                </Badge>
                {guitar.yearManufactured && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {guitar.yearManufactured}
                  </Badge>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Last updated 2 hours ago</span>
                </div>
              </div>
            </div>

            {/* Market Price */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Average Market Price
                  </h3>
                  <p className="text-sm text-gray-600">
                    {marketDataLoading ? 'Loading market data...' : 'Based on recent sales data across platforms'}
                  </p>
                </div>
                <div className="text-right">
                  {marketDataLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-gray-900">
                        ${guitar.avgMarketPrice.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <Star className="w-4 h-4 mr-1" />
                        <span>Market reference</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {guitar.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {guitar.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 