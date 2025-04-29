
import React, { useState, useEffect } from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { SuggestionForm } from '@/components/shopping/SuggestionForm';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Coffee, ThumbsUp, Heart, Lightbulb, Tool, Filter, ArrowUpDown } from 'lucide-react'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ProductSuggestionsPage = () => {
  const [activeTab, setActiveTab] = useState('suggest');
  const { fetchUserSuggestions, suggestProduct } = useProducts();
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState('newest');
  const [approvalFilter, setApprovalFilter] = useState('all');

  useEffect(() => {
    async function loadSuggestions() {
      setIsLoading(true);
      try {
        // Include unapproved suggestions in the results
        const includeUnapproved = approvalFilter === 'all' || approvalFilter === 'pending';
        const suggestions = await fetchUserSuggestions(includeUnapproved);
        
        let filteredSuggestions = [...suggestions];
        
        // Apply approval filter
        if (approvalFilter === 'approved') {
          filteredSuggestions = filteredSuggestions.filter(item => item.is_approved);
        } else if (approvalFilter === 'pending') {
          filteredSuggestions = filteredSuggestions.filter(item => !item.is_approved);
        }
        
        // Apply sorting
        filteredSuggestions.sort((a, b) => {
          switch (sortOption) {
            case 'newest':
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest':
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'price_asc':
              return (a.price || 0) - (b.price || 0);
            case 'price_desc':
              return (b.price || 0) - (a.price || 0);
            case 'name_asc':
              return a.title.localeCompare(b.title);
            case 'name_desc':
              return b.title.localeCompare(a.title);
            default:
              return 0;
          }
        });
        
        setSuggestedProducts(filteredSuggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (activeTab === 'browse') {
      loadSuggestions();
    }
  }, [activeTab, fetchUserSuggestions, sortOption, approvalFilter]);

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
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium mb-1">Community Suggestions</h3>
                <p className="text-muted-foreground">
                  These are tools that have been suggested by our community. Approved suggestions will appear in our main catalog.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    defaultValue="all" 
                    value={approvalFilter}
                    onValueChange={(value) => setApprovalFilter(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All suggestions</SelectItem>
                      <SelectItem value="approved">Approved only</SelectItem>
                      <SelectItem value="pending">Pending approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    defaultValue="newest"
                    value={sortOption}
                    onValueChange={(value) => setSortOption(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="price_asc">Price: Low to high</SelectItem>
                      <SelectItem value="price_desc">Price: High to low</SelectItem>
                      <SelectItem value="name_asc">Name: A to Z</SelectItem>
                      <SelectItem value="name_desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/4 mb-4"></div>
                      <div className="h-9 bg-slate-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {approvalFilter !== 'all' && (
                  <div className="mb-4">
                    <Badge 
                      variant={approvalFilter === 'approved' ? 'success' : 'default'} 
                      className="mr-2"
                    >
                      Showing {approvalFilter === 'approved' ? 'approved' : 'pending'} suggestions
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setApprovalFilter('all')}
                      className="text-xs"
                    >
                      Clear filter
                    </Button>
                  </div>
                )}
                
                <ProductGrid 
                  products={suggestedProducts} 
                  isLoading={isLoading} 
                  emptyMessage="No product suggestions yet. Be the first to suggest a tool!" 
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </ShoppingPageLayout>
  );
};

export default ProductSuggestionsPage;
