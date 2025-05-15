
import React, { useState, useEffect } from "react";
import { 
  getPublicShops, 
  registerWithShop,
  ShopDirectoryItem 
} from "@/services/shopDirectory/shopDirectoryService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  Locate, 
  PlusCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface ShopDirectoryProps {
  customerId: string;
}

export function ShopDirectory({ customerId }: ShopDirectoryProps) {
  const [shops, setShops] = useState<ShopDirectoryItem[]>([]);
  const [filteredShops, setFilteredShops] = useState<ShopDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const { toast } = useToast();

  // Load shops when component mounts
  useEffect(() => {
    loadShops();
  }, []);

  // Filter shops when search term or user location changes
  useEffect(() => {
    filterShops();
  }, [searchTerm, userLocation, shops]);

  const loadShops = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      // If we have user's location, include it in the query
      if (userLocation) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
      }
      
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }
      
      const shopsList = await getPublicShops(params);
      setShops(shopsList);
      setFilteredShops(shopsList);
    } catch (error) {
      console.error("Error loading shops:", error);
      toast({
        title: "Error",
        description: "Failed to load shops directory.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterShops = () => {
    let filtered = [...shops];
    
    // Filter by search term if provided
    if (searchTerm) {
      filtered = filtered.filter(shop => 
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.city && shop.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shop.state && shop.state.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredShops(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        
        // Reload shops with the location params
        loadShops();
        
        toast({
          title: "Location Found",
          description: "Showing shops near your current location",
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: error.message || "Could not get your location",
          variant: "destructive",
        });
      }
    );
  };

  const handleRegisterWithShop = async (shopId: string) => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "You must be logged in to register with a shop",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setRegistering(shopId);
      const success = await registerWithShop(customerId, shopId);
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: "You have been registered with this shop",
        });
      }
    } catch (error) {
      console.error("Error registering with shop:", error);
      toast({
        title: "Registration Failed",
        description: "There was a problem registering with this shop",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Shop Directory</h2>
      </div>
      
      <div className="bg-white p-3 shadow-sm border border-gray-200 rounded-xl flex flex-wrap gap-2 mb-4">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
            <Input
              placeholder="Search shops by name or location..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleGetLocation}
            className="flex items-center gap-1"
          >
            <Locate className="h-4 w-4" />
            <span>Near Me</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredShops.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No shops found in the directory.</p>
            {userLocation ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or expanding your search radius.
              </p>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleGetLocation}
                className="mt-2 flex items-center gap-1"
              >
                <Locate className="h-4 w-4" />
                <span>Find Shops Near Me</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {shop.shop_image_url && (
                <div className="h-32 overflow-hidden">
                  <img 
                    src={shop.shop_image_url} 
                    alt={shop.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold text-blue-600">{shop.name}</CardTitle>
                    <CardDescription>
                      {shop.city}{shop.city && shop.state ? ", " : ""}{shop.state}
                      {shop.distance !== undefined && (
                        <Badge className="ml-2 bg-green-100 text-green-800 border border-green-300 text-xs">
                          {shop.distance.toFixed(1)} miles away
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  {shop.logo_url && (
                    <div className="h-12 w-12 overflow-hidden rounded-md">
                      <img 
                        src={shop.logo_url} 
                        alt={`${shop.name} logo`}
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
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
                  
                  {shop.shop_description && (
                    <div className="pt-2">
                      <Label className="text-xs text-muted-foreground">About:</Label>
                      <p className="text-sm mt-1">{shop.shop_description}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => handleRegisterWithShop(shop.id)}
                    disabled={registering === shop.id}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {registering === shop.id ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Registering...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Register with Shop
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
