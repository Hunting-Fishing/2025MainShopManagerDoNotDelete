import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsSeederProps {
  products: any[];
  onSeedingComplete?: () => void;
}

const AnalyticsSeeder: React.FC<AnalyticsSeederProps> = ({ 
  products, 
  onSeedingComplete 
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'seeding' | 'completed' | 'error'>('idle');
  const { toast } = useToast();

  const generateRandomInteractions = async () => {
    setIsSeeding(true);
    setStatus('seeding');
    setProgress(0);

    try {
      const interactionTypes = ['view', 'click', 'add_to_cart', 'save', 'share'];
      const totalInteractions = Math.min(products.length * 5, 200); // Limit to reasonable number
      let completedInteractions = 0;

      // Generate interactions in batches
      for (let i = 0; i < totalInteractions; i += 20) {
        const batch = [];
        const batchSize = Math.min(20, totalInteractions - i);

        for (let j = 0; j < batchSize; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
          
          // Create weighted probabilities (views most common, purchases least common)
          const weights = { view: 50, click: 25, save: 15, share: 8, add_to_cart: 2 };
          const weightedTypes = [];
          for (const [type, weight] of Object.entries(weights)) {
            for (let k = 0; k < weight; k++) {
              weightedTypes.push(type);
            }
          }
          const weightedType = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];

          // Generate realistic timestamp (last 30 days)
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const randomTimestamp = new Date(
            thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
          );

          batch.push({
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            interaction_type: weightedType,
            created_at: randomTimestamp.toISOString(),
            metadata: {
              price: product.price || 0,
              manufacturer: product.manufacturer,
              generated: true, // Mark as seed data
              session_id: `seed_${Math.random().toString(36).substr(2, 9)}`
            }
          });
        }

        // Insert batch
        const { error } = await supabase
          .from('product_analytics')
          .insert(batch);

        if (error) throw error;

        completedInteractions += batchSize;
        setProgress((completedInteractions / totalInteractions) * 100);

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate some recently viewed products
      const recentlyViewedBatch = [];
      for (let i = 0; i < Math.min(10, products.length); i++) {
        const product = products[i];
        const recentTimestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000); // Last 24 hours

        recentlyViewedBatch.push({
          product_id: product.id,
          product_name: product.name,
          product_image_url: product.imageUrl,
          category: product.category,
          viewed_at: recentTimestamp.toISOString()
        });
      }

      const { error: recentError } = await supabase
        .from('recently_viewed_products')
        .insert(recentlyViewedBatch);

      if (recentError) {
        console.error('Error seeding recently viewed:', recentError);
        // Don't fail the whole operation for this
      }

      // Generate some search analytics
      const searchQueries = [
        'wrench', 'socket set', 'drill', 'impact gun', 'torque wrench',
        'tire iron', 'jack', 'multimeter', 'scanner', 'brake tools'
      ];

      const searchBatch = [];
      for (const query of searchQueries) {
        const resultsCount = Math.floor(Math.random() * 20) + 1;
        const searchTime = Math.floor(Math.random() * 500) + 100;
        
        searchBatch.push({
          query,
          results_count: resultsCount,
          search_time_ms: searchTime,
          success_rate: resultsCount > 0 ? 1 : 0,
          click_through_rate: Math.random() * 0.3, // 0-30% CTR
          filters_used: {
            category: Math.random() > 0.7 ? 'hand_tools' : null,
            price_range: Math.random() > 0.8 ? [50, 200] : null
          }
        });
      }

      const { error: searchError } = await supabase
        .from('ai_search_analytics')
        .insert(searchBatch);

      if (searchError) {
        console.error('Error seeding search analytics:', searchError);
        // Don't fail the whole operation for this
      }

      setStatus('completed');
      setProgress(100);
      
      toast({
        title: "Analytics data seeded successfully",
        description: `Generated ${totalInteractions} product interactions and related analytics data.`,
      });

      if (onSeedingComplete) {
        onSeedingComplete();
      }

    } catch (error) {
      console.error('Error seeding analytics data:', error);
      setStatus('error');
      toast({
        title: "Error seeding data",
        description: "Failed to generate analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const clearAnalyticsData = async () => {
    try {
      setIsSeeding(true);
      
      // Clear generated analytics data
      await supabase
        .from('product_analytics')
        .delete()
        .eq('metadata->>generated', 'true');
      
      await supabase
        .from('recently_viewed_products')
        .delete()
        .not('id', 'is', null); // Clear all recently viewed
      
      await supabase
        .from('ai_search_analytics')
        .delete()
        .not('id', 'is', null); // Clear all search analytics
      
      setStatus('idle');
      setProgress(0);
      
      toast({
        title: "Analytics data cleared",
        description: "All generated analytics data has been removed.",
      });
      
    } catch (error) {
      console.error('Error clearing analytics data:', error);
      toast({
        title: "Error clearing data",
        description: "Failed to clear analytics data.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Analytics Data Seeder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate sample analytics data to test popular products, recommendations, and analytics features.
        </p>
        
        {isSeeding && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating analytics data...</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Data seeded successfully!</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error seeding data</span>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={generateRandomInteractions}
            disabled={isSeeding || products.length === 0}
            className="w-full"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              'Generate Sample Data'
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={clearAnalyticsData}
            disabled={isSeeding}
            className="w-full"
          >
            Clear Generated Data
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          This will generate realistic interaction patterns for {products.length} products.
        </p>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSeeder;