
import React, { useState, useEffect } from "react";
import { 
  getPublicShops, 
  registerWithShop, 
  ShopDirectoryItem 
} from "@/services/shopDirectory/shopDirectoryService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, MapPin, Phone, Mail, ExternalLink, PlusCircle } from "lucide-react";

export function ShopDirectory({ customerId }: { customerId: string }) {
  const [shops, setShops] = useState<ShopDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    loadShops();
  }, [userCoordinates]);
  
  const loadShops = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }
      
      if (userCoordinates) {
        params.latitude = userCoordinates.latitude;
        params.longitude = userCoordinates.longitude;
        params.radius = 50; // 50 mile radius
      }
      
      const publicShops = await getPublicShops(params);
      setShops(publicShops);
    } catch (error) {
      console.error("Error loading shops:", error);
      toast({
        title: "Error",
        description: "Failed to load shop directory.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (shopId: string) => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "You must be logged in to register with a shop.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await registerWithShop(customerId, shopId);
      if (success) {
        toast({
          title: "Success",
          description: "You've been registered with this shop.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error registering with shop:", error);
      toast({
        title: "Error",
        description: "Failed to register with shop. Please try again.",
        variant: "destructive",
      });
    }
  };

  const enableLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationEnabled(true);
          toast({
            title: "Location Enabled",
            description: "Showing shops near your location.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check your browser permissions.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadShops();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Shop Directory</h2>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>
            Browse and register with shops in our network. Find shops near you or use the search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, city, or state..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            
            <Button
              type="button"
              variant={locationEnabled ? "default" : "outline"}
              onClick={enableLocationSearch}
              className="md:w-auto"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {locationEnabled ? "Location Active" : "Use My Location"}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No shops found. Try a different search term or location.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shops.map((shop) => (
                <Card key={shop.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-2">
                    <CardTitle className="text-lg">{shop.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      {shop.city}, {shop.state}
                      {shop.distance !== undefined && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          {shop.distance.toFixed(1)} miles
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <span>{shop.address}</span>
                    </div>
                    {shop.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                    {shop.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{shop.email}</span>
                      </div>
                    )}
                    <div className="pt-2 flex justify-between items-center">
                      {shop.shop_description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {shop.shop_description}
                        </span>
                      )}
                      <div className="flex space-x-2 mt-2">
                        <Button 
                          onClick={() => handleRegister(shop.id)} 
                          size="sm" 
                          className="px-3"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Register
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
