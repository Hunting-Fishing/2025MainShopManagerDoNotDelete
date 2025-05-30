
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { AUTOMOTIVE_SERVICE_TAXONOMY, findServiceCategory } from '@/utils/automotive/serviceTaxonomy';

interface ServiceQualityMetricsProps {
  categories: ServiceMainCategory[];
}

export const ServiceQualityMetrics: React.FC<ServiceQualityMetricsProps> = ({ categories }) => {
  // Calculate quality metrics
  const totalServices = categories.reduce((total, cat) => 
    total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0
  );

  const categorizedServices = categories.reduce((total, cat) => 
    total + cat.subcategories.reduce((subTotal, sub) => 
      subTotal + sub.jobs.filter(job => findServiceCategory(job.name)).length, 0
    ), 0
  );

  const servicesWithPricing = categories.reduce((total, cat) => 
    total + cat.subcategories.reduce((subTotal, sub) => 
      subTotal + sub.jobs.filter(job => job.price && job.price > 0).length, 0
    ), 0
  );

  const servicesWithTiming = categories.reduce((total, cat) => 
    total + cat.subcategories.reduce((subTotal, sub) => 
      subTotal + sub.jobs.filter(job => job.estimatedTime && job.estimatedTime > 0).length, 0
    ), 0
  );

  const categorizationScore = totalServices > 0 ? (categorizedServices / totalServices) * 100 : 0;
  const pricingScore = totalServices > 0 ? (servicesWithPricing / totalServices) * 100 : 0;
  const timingScore = totalServices > 0 ? (servicesWithTiming / totalServices) * 100 : 0;
  const overallScore = (categorizationScore + pricingScore + timingScore) / 3;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Quality Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overall Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {Math.round(overallScore)}%
              </span>
              <Badge className={getScoreBadge(overallScore)}>
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <Progress value={overallScore} className="h-2" />
            <p className="text-xs text-gray-600">
              Based on categorization, pricing, and timing completeness
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categorization Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Categorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(categorizationScore)}`}>
                {Math.round(categorizationScore)}%
              </span>
              <span className="text-sm text-gray-600">
                {categorizedServices}/{totalServices}
              </span>
            </div>
            <Progress value={categorizationScore} className="h-2" />
            <p className="text-xs text-gray-600">
              Services properly categorized by automotive standards
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Completeness */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(pricingScore)}`}>
                {Math.round(pricingScore)}%
              </span>
              <span className="text-sm text-gray-600">
                {servicesWithPricing}/{totalServices}
              </span>
            </div>
            <Progress value={pricingScore} className="h-2" />
            <p className="text-xs text-gray-600">
              Services with pricing information
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timing Completeness */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Labor Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(timingScore)}`}>
                {Math.round(timingScore)}%
              </span>
              <span className="text-sm text-gray-600">
                {servicesWithTiming}/{totalServices}
              </span>
            </div>
            <Progress value={timingScore} className="h-2" />
            <p className="text-xs text-gray-600">
              Services with estimated labor times
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
