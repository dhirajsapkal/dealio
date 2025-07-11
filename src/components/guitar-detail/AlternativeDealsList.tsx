import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin, Calendar, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlternativeDealsListProps {
  deals: Array<{
    id: string;
    price: number;
    marketplace: 'Facebook' | 'Reverb' | 'eBay' | 'Craigslist' | 'Guitar Center' | 'Sweetwater';
    sellerLocation: string;
    datePosted: string;
    listingUrl: string;
    condition: 'New' | 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
    score: number; // Mini deal score 0-100
    sellerVerified: boolean;
    quickNotes?: string;
  }>;
}

/**
 * Alternative Deals List Component
 * Displays a compact list of other available deals with mini-scores and quick actions
 */
export default function AlternativeDealsList({ deals }: AlternativeDealsListProps) {
  // Marketplace icons mapping
  const getMarketplaceIcon = (marketplace: string) => {
    const iconProps = "w-6 h-6";
    switch (marketplace) {
      case 'Reverb':
        return <div className={`${iconProps} bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs`}>R</div>;
      case 'eBay':
        return <div className={`${iconProps} bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs`}>e</div>;
      case 'Facebook':
        return <div className={`${iconProps} bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs`}>f</div>;
      case 'Craigslist':
        return <div className={`${iconProps} bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs`}>CL</div>;
      case 'Guitar Center':
        return <div className={`${iconProps} bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs`}>GC</div>;
      case 'Sweetwater':
        return <div className={`${iconProps} bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs`}>SW</div>;
      default:
        return <div className={`${iconProps} bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xs`}>?</div>;
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

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-orange-500 bg-orange-50';
    return 'text-red-500 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 50) return <Star className="w-4 h-4 text-orange-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  // Mini circular progress for scores
  const MiniScoreVisualization = ({ score }: { score: number }) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width="40" height="40" className="transform -rotate-90">
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-200"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={score >= 85 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-500'}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${score >= 85 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
            {score}
          </span>
        </div>
      </div>
    );
  };

  if (deals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Alternative Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="text-gray-600">No alternative deals found at this time.</p>
              <p className="text-sm text-gray-500 mt-2">We'll notify you when new listings become available.</p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="mb-6 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CardTitle className="text-xl font-bold text-gray-900">
              Alternative Deals ({deals.length})
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {deals.map((deal, index) => (
                <motion.div 
                  key={deal.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Marketplace & Score */}
                    <motion.div 
                      className="md:col-span-2 flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.1 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getMarketplaceIcon(deal.marketplace)}
                      </motion.div>
                      <div className="hidden md:block">
                        <div className="font-medium text-sm text-gray-900">{deal.marketplace}</div>
                        <div className="text-xs text-gray-500">{deal.condition}</div>
                      </div>
                    </motion.div>

                    {/* Price */}
                    <motion.div 
                      className="md:col-span-2"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        ${deal.price.toLocaleString()}
                      </div>
                      <Badge className={`text-xs border ${getConditionColor(deal.condition)} md:hidden`}>
                        {deal.condition}
                      </Badge>
                    </motion.div>

                    {/* Location & Date */}
                    <motion.div 
                      className="md:col-span-3 space-y-1"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{deal.sellerLocation}</span>
                        {deal.sellerVerified && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
                          </motion.div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{deal.datePosted}</span>
                      </div>
                    </motion.div>

                    {/* Quick Notes */}
                    <motion.div 
                      className="md:col-span-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      {deal.quickNotes && (
                        <p className="text-sm text-gray-600 italic">"{deal.quickNotes}"</p>
                      )}
                    </motion.div>

                    {/* Score & Action */}
                    <motion.div 
                      className="md:col-span-2 flex items-center justify-between md:justify-end gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MiniScoreVisualization score={deal.score} />
                        </motion.div>
                        <div className="hidden md:block">
                          <div className={`text-xs font-medium ${getScoreColor(deal.score)}`}>
                            Score {deal.score}
                          </div>
                        </div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(deal.listingUrl, '_blank')}
                          className="flex-shrink-0 hover:bg-teal-50 hover:border-teal-300 group-hover:border-teal-400 transition-all duration-200"
                        >
                          <ExternalLink className="w-4 h-4 mr-1 hidden sm:inline" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Mobile Layout Additions */}
                  <motion.div 
                    className="md:hidden mt-3 pt-3 border-t border-gray-100"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Deal Score:</span>
                        <Badge className={`text-xs ${getScoreColor(deal.score)}`}>
                          {deal.score}/100
                        </Badge>
                      </div>
                      {deal.sellerVerified && (
                        <motion.div 
                          className="flex items-center gap-1 text-xs text-green-600"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Verified Seller</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <p className="text-sm text-gray-600">
              Deals are updated every hour. <strong>Scores</strong> consider price, seller credibility, and listing quality.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 