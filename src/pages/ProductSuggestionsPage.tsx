import { useState } from 'react';
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuggestionForm } from "@/components/shopping/SuggestionForm";
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/shopping';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react'; // Changed from 'Tool' to 'Wrench'
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { toast } from '@/hooks/use-toast';

export default function ProductSuggestionsPage() {
  const [activeTab, setActiveTab] = useState("suggest");
  const { fetchUserSuggestions, suggestProduct } = useProducts();
  const [userSuggestions, setUserSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to load user suggestions
  const loadUserSuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await fetchUserSuggestions();
      setUserSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: "Error loading suggestions",
        description: "Could not load product suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "browse" && userSuggestions.length === 0) {
      loadUserSuggestions();
    }
  };

  // Handle form submission
  const handleSubmit = async (data: Partial<Product>) => {
    try {
      await suggestProduct(data);
      setActiveTab("browse");
      await loadUserSuggestions(); // Reload suggestions after adding a new one
      return true;
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      return false;
    }
  };

  // Components for displaying user suggestions
  const SuggestionItem = ({ product }: { product: Product }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.title} 
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
              <Wrench className="text-gray-400" size={24} /> {/* Changed from 'Tool' to 'Wrench' */}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-medium">{product.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.description || "No description provided"}</p>
            
            <div className="flex items-center mt-2 gap-2">
              {product.is_approved ? (
                <Badge className="bg-green-100 text-green-800 border border-green-300">
                  Approved
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                  Pending Review
                </Badge>
              )}
              
              {product.price && (
                <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptySuggestions = () => (
    <div className="text-center py-12">
      <Wrench className="mx-auto text-gray-400" size={48} /> {/* Changed from 'Tool' to 'Wrench' */}
      <h3 className="mt-4 text-lg font-medium">No Suggestions Yet</h3>
      <p className="mt-2 text-gray-500">Be the first to suggest a product!</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={() => setActiveTab("suggest")}
      >
        Suggest a Product
      </Button>
    </div>
  );

  return (
    <ShoppingPageLayout title="Product Suggestions">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Product Suggestions</h1>
          <p className="text-gray-600 mt-2">
            Suggest tools and products that you'd like to see in our shop or browse existing suggestions
          </p>
        </div>
        
        <Tabs 
          defaultValue="suggest" 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="suggest">Suggest a Product</TabsTrigger>
            <TabsTrigger value="browse">Browse Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggest" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <SuggestionForm onSubmit={handleSubmit} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="browse" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : userSuggestions.length > 0 ? (
              <div>
                {userSuggestions.map((product) => (
                  <SuggestionItem key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptySuggestions />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ShoppingPageLayout>
  );
}
