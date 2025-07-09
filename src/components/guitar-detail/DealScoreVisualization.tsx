import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface DealScoreVisualizationProps {
  score: number; // 0-100
  breakdown: {
    priceScore: number;
    sellerScore: number;
    listingScore: number;
  };
}

/**
 * Deal Score Visualization Component
 * Displays the overall deal score with color coding and circular progress visualization
 */
export default function DealScoreVisualization({ score, breakdown }: DealScoreVisualizationProps) {
  // Determine score color and risk level
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (score >= 50) return <TrendingUp className="w-6 h-6 text-orange-500" />;
    return <AlertTriangle className="w-6 h-6 text-red-500" />;
  };

  const getRiskLabel = (score: number) => {
    if (score >= 85) return 'Excellent Deal';
    if (score >= 50) return 'Good Deal';
    return 'High Risk';
  };

  const getRiskDescription = (score: number) => {
    if (score >= 85) return 'This appears to be an excellent deal with low risk factors.';
    if (score >= 50) return 'This is a reasonable deal, but review the details carefully.';
    return 'Proceed with caution. Several risk factors have been identified.';
  };

  // Custom circular progress component
  const CircularProgress = ({ value, size = 120 }: { value: number; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={getScoreColor(value)}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        {/* Score text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getScoreColor(value)}`}>
            {value}
          </span>
          <span className="text-sm text-gray-600">/ 100</span>
        </div>
      </div>
    );
  };

  return (
    <Card className={`border-2 ${getScoreBgColor(score)} mb-6`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {getScoreIcon(score)}
          Deal Score Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Circular Score Visualization */}
          <div className="flex flex-col items-center justify-center">
            <CircularProgress value={score} />
            <div className="text-center mt-4">
              <Badge className={`text-sm px-3 py-1 ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
                {getRiskLabel(score)}
              </Badge>
              <p className="text-sm text-gray-600 mt-2 max-w-xs">
                {getRiskDescription(score)}
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
            
            {/* Price Analysis (50 points) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Price Analysis</span>
                <span className="text-sm font-bold">{breakdown.priceScore}/50</span>
              </div>
              <Progress value={(breakdown.priceScore / 50) * 100} className="h-2" />
              <p className="text-xs text-gray-600">
                Compared to market average and recent sales
              </p>
            </div>

            {/* Seller Credibility (25 points) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Seller Credibility</span>
                <span className="text-sm font-bold">{breakdown.sellerScore}/25</span>
              </div>
              <Progress value={(breakdown.sellerScore / 25) * 100} className="h-2" />
              <p className="text-xs text-gray-600">
                Account verification, ratings, and history
              </p>
            </div>

            {/* Listing Quality (25 points) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Listing Quality</span>
                <span className="text-sm font-bold">{breakdown.listingScore}/25</span>
              </div>
              <Progress value={(breakdown.listingScore / 25) * 100} className="h-2" />
              <p className="text-xs text-gray-600">
                Description quality, photos, and condition details
              </p>
            </div>
          </div>
        </div>

        {/* Score Explanation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>How we calculate this score:</strong> This score considers price relative to market, 
            seller credibility, and listing quality. Higher scores indicate better deals with lower risk factors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 