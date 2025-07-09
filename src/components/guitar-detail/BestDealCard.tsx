import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin, Calendar, Shield, Star } from 'lucide-react';

interface BestDealCardProps {
  deal: {
    id: string;
    price: number;
    originalPrice?: number;
    marketplace: 'Facebook' | 'Reverb' | 'eBay' | 'Craigslist' | 'Guitar Center' | 'Sweetwater';
    sellerLocation: string;
    datePosted: string;
    listingUrl: string;
    sellerInfo: {
      name: string;
      verified: boolean;
      rating?: number;
      accountAge?: string;
    };
    condition: 'New' | 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  };
}

/**
 * Best Deal Card Component
 * Displays the best available deal with prominent pricing and marketplace information
 */
export default function BestDealCard({ deal }: BestDealCardProps) {
  // Marketplace logos/icons mapping
  const getMarketplaceIcon = (marketplace: string) => {
    const iconProps = "w-8 h-8";
    switch (marketplace) {
      case 'Reverb':
        return <div className={`${iconProps} bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>R</div>;
      case 'eBay':
        return <div className={`${iconProps} bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>e</div>;
      case 'Facebook':
        return <div className={`${iconProps} bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>f</div>;
      case 'Craigslist':
        return <div className={`${iconProps} bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>CL</div>;
      case 'Guitar Center':
        return <div className={`${iconProps} bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>GC</div>;
      case 'Sweetwater':
        return <div className={`${iconProps} bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>SW</div>;
      default:
        return <div className={`${iconProps} bg-gray-500 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>?</div>;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New': return 'bg-green-50 text-green-700 border-green-200';
      case 'Excellent': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Very Good': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Good': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Fair': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Poor': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const savings = deal.originalPrice ? deal.originalPrice - deal.price : 0;
  const savingsPercentage = deal.originalPrice ? ((savings / deal.originalPrice) * 100).toFixed(0) : 0;

  return (
    <Card className="border-2 border-green-200 bg-green-50/30 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            Best Deal Found
          </CardTitle>
          <Badge className={`border ${getConditionColor(deal.condition)}`}>
            {deal.condition}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              {getMarketplaceIcon(deal.marketplace)}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{deal.marketplace}</h3>
                <p className="text-sm text-gray-600">Online Marketplace</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-green-600">
                  ${deal.price.toLocaleString()}
                </span>
                {deal.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${deal.originalPrice.toLocaleString()}
                    </span>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Save ${savings.toLocaleString()} ({savingsPercentage}%)
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Location and Date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{deal.sellerLocation}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Posted {deal.datePosted}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{deal.sellerInfo.name}</span>
                  {deal.sellerInfo.verified && (
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {deal.sellerInfo.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{deal.sellerInfo.rating}/5</span>
                    </div>
                  )}
                  {deal.sellerInfo.accountAge && (
                    <span>• Member {deal.sellerInfo.accountAge}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex flex-col justify-center">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 mb-3"
              onClick={() => window.open(deal.listingUrl, '_blank')}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Listing
            </Button>
            <p className="text-xs text-gray-600 text-center">
              Opens in {deal.marketplace}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 