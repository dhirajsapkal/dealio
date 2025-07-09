import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, DollarSign, User, FileText, Image, XCircle } from 'lucide-react';

interface DealAnalysisAccordionProps {
  analysis: {
    priceAnalysis: {
      percentageBelowMarket: number;
      marketComparison: string;
      priceHistory: string;
    };
    sellerCredibility: {
      verified: boolean;
      accountAge: string;
      rating?: number;
      totalSales?: number;
      redFlags: string[];
    };
    listingQuality: {
      imageCount: number;
      imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
      descriptionLength: number;
      negativeKeywords: string[];
      positiveKeywords: string[];
    };
    redFlags: string[];
    positiveSignals: string[];
  };
}

/**
 * Deal Analysis Accordion Component
 * Provides detailed breakdown of all analysis factors in expandable sections
 */
export default function DealAnalysisAccordion({ analysis }: DealAnalysisAccordionProps) {
  const getImageQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Fair': return 'text-yellow-600 bg-yellow-50';
      case 'Poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
          {/* Price Analysis */}
          <AccordionItem value="price-analysis">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Price Analysis</span>
                <Badge variant="secondary" className="ml-auto mr-4">
                  {analysis.priceAnalysis.percentageBelowMarket > 0 ? 
                    `${analysis.priceAnalysis.percentageBelowMarket}% below market` : 
                    'At market price'
                  }
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Market Comparison</h4>
                    <p className="text-sm text-gray-600 mb-3">{analysis.priceAnalysis.marketComparison}</p>
                    <div className="flex items-center gap-2">
                      {analysis.priceAnalysis.percentageBelowMarket > 15 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : analysis.priceAnalysis.percentageBelowMarket > 5 ? (
                        <CheckCircle className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {analysis.priceAnalysis.percentageBelowMarket > 15 ? 'Excellent price' : 
                         analysis.priceAnalysis.percentageBelowMarket > 5 ? 'Good price' : 'Fair price'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Price History</h4>
                    <p className="text-sm text-gray-600">{analysis.priceAnalysis.priceHistory}</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seller Credibility */}
          <AccordionItem value="seller-credibility">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Seller Credibility</span>
                <div className="ml-auto mr-4 flex items-center gap-2">
                  {analysis.sellerCredibility.verified ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <Badge variant="secondary">
                    {analysis.sellerCredibility.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Account Status</span>
                      <div className="flex items-center gap-2">
                        {analysis.sellerCredibility.verified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {analysis.sellerCredibility.verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Account Age</span>
                      <span className="text-sm">{analysis.sellerCredibility.accountAge}</span>
                    </div>

                    {analysis.sellerCredibility.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Seller Rating</span>
                        <span className="text-sm">{analysis.sellerCredibility.rating}/5 stars</span>
                      </div>
                    )}

                    {analysis.sellerCredibility.totalSales && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total Sales</span>
                        <span className="text-sm">{analysis.sellerCredibility.totalSales} items</span>
                      </div>
                    )}
                  </div>

                  {analysis.sellerCredibility.redFlags.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Red Flags
                      </h4>
                      <ul className="space-y-1">
                        {analysis.sellerCredibility.redFlags.map((flag, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-600 rounded-full" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Listing Quality */}
          <AccordionItem value="listing-quality">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">Listing Quality Analysis</span>
                <Badge variant="secondary" className="ml-auto mr-4">
                  {analysis.listingQuality.imageCount} photos
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Image Quality</span>
                      <Badge className={getImageQualityColor(analysis.listingQuality.imageQuality)}>
                        {analysis.listingQuality.imageQuality}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Image Count</span>
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{analysis.listingQuality.imageCount} photos</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Description Length</span>
                      <span className="text-sm">{analysis.listingQuality.descriptionLength} characters</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {analysis.listingQuality.positiveKeywords.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2 text-sm">Positive Signals</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysis.listingQuality.positiveKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.listingQuality.negativeKeywords.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-2 text-sm">Warning Keywords</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysis.listingQuality.negativeKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-red-100 text-red-700">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Overall Assessment */}
          <AccordionItem value="overall-assessment">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Overall Assessment</span>
                <Badge variant="secondary" className="ml-auto mr-4">
                  {analysis.redFlags.length} red flags
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.positiveSignals.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Positive Signals
                    </h4>
                    <ul className="space-y-2">
                      {analysis.positiveSignals.map((signal, index) => (
                        <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.redFlags.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Red Flags
                    </h4>
                    <ul className="space-y-2">
                      {analysis.redFlags.map((flag, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
} 