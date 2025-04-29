
import React, { useState, useEffect } from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { SuggestionForm } from '@/components/shopping/SuggestionForm';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Coffee, ThumbsUp, Heart, Lightbulb } from 'lucide-react'; 

const ProductSuggestionsPage = () => {
  const [activeTab, setActiveTab] = useState('suggest');
  const { fetchUserSuggestions } = useProducts();
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      setIsLoading(true);
      const suggestions = await fetchUserSuggestions(true);
      setSuggestedProducts(suggestions);
      setIsLoading(false);
    }

    if (activeTab === 'browse') {
      loadSuggestions();
    }
  }, [activeTab, fetchUserSuggestions]);

  return (
    <ShoppingPageLayout
      title="Product Suggestions"
      description="Suggest tools you'd like to see in our catalog or browse community suggestions"
    >
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-blue-500 p-4 rounded-full text-white">
                <Lightbulb size={32} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Help Us Improve Our Tool Catalog
                </h3>
                <p className="text-blue-700">
                  Know of a great automotive tool that's missing from our catalog? Help fellow mechanics by suggesting 
                  it here. We regularly review community suggestions and add the best ones to our collection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suggest" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 grid w-full grid-cols-2">
          <TabsTrigger value="suggest" className="data-[state=active]:bg-white rounded-md">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <span>Suggest a Product</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="browse" className="data-[state=active]:bg-white rounded-md">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              <span>Browse Suggestions</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggest" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SuggestionForm />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>
                    Our community-driven suggestions process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">
                      <span className="font-medium">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Submit a Suggestion</h4>
                      <p className="text-sm text-muted-foreground">
                        Fill out the form with information about the tool you're recommending
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">
                      <span className="font-medium">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Review Process</h4>
                      <p className="text-sm text-muted-foreground">
                        Our team reviews all suggestions for quality and relevance
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">
                      <span className="font-medium">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Product Addition</h4>
                      <p className="text-sm text-muted-foreground">
                        Approved suggestions are added to our product catalog
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    We appreciate your contribution to making our tool catalog more comprehensive!
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="browse">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Community Suggestions</h3>
            <p className="text-muted-foreground">
              These are tools that have been suggested by our community. Approved suggestions will appear in our main catalog.
            </p>
          </div>
          
          <ProductGrid 
            products={suggestedProducts} 
            isLoading={isLoading} 
            emptyMessage="No product suggestions yet. Be the first to suggest a tool!" 
          />
        </TabsContent>
      </Tabs>
    </ShoppingPageLayout>
  );
};

export default ProductSuggestionsPage;
