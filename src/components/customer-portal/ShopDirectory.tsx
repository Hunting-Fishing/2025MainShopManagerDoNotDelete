
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  getPublicShops, 
  registerWithShop, 
  getCustomerShops, 
  ShopDirectoryItem 
} from "@/services/shopDirectory/shopDirectoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Phone, Mail, PlusCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ShopDirectoryProps {
  customerId?: string;
}

export function ShopDirectory({ customerId }: ShopDirectoryProps) {
  const [shops, setShops] = useState<ShopDirectoryItem[]>([]);
  const [registeredShops, setRegisteredShops] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const { toast } = useToast();

  // Load shops and user's registered shops
  useEffect(() => {
    const loadShops = async () => {
      try {
        setIsLoading(true);
        
        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.log("Geolocation error:", error);
            }
          );
        }
        
        // Fetch all public shops
        const publicShops = await getPublicShops({
          searchTerm,
          latitude: userLocation?.lat,
          longitude: userLocation?.lng
        });
        setShops(publicShops);
        
        // If we have a customer ID, get their registered shops
        if (customerId) {
          const customerShops = await getCustomerShops(customerId);
          setRegisteredShops(customerShops.map(shop => shop.id));
        }
      } catch (error) {
        console.error("Error loading shops:", error);
        toast({
          title: "Error",
          description: "Failed to load shops. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShops();
  }, [customerId, searchTerm, userLocation?.lat, userLocation?.lng, toast]);

  const handleRegister = async (shopId: string) => {
    if (!customerId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to register with this shop.",
        variant: "default",
      });
      return;
    }
    
    try {
      const success = await registerWithShop(customerId, shopId);
      if (success) {
        setRegisteredShops(prev => [...prev, shopId]);
        toast({
          title: "Success",
          description: "You've successfully registered with this shop.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error registering with shop:", error);
      toast({
        title: "Registration failed",
        description: "Could not register with this shop. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Shop Directory</h2>
        <p className="text-muted-foreground">
          Browse trusted repair shops and register to earn loyalty points and exclusive offers.
        </p>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by shop name or location..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {shops.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No shops found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or try again later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => (
                <Card key={shop.id} className="overflow-hidden">
                  {shop.shop_image_url ? (
                    <div 
                      className="h-40 w-full bg-cover bg-center" 
                      style={{ backgroundImage: `url(${shop.shop_image_url})` }}
                    />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">{shop.name}</span>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{shop.name}</CardTitle>
                      {shop.distance !== undefined && (
                        <Badge variant="outline" className="ml-2">
                          {shop.distance.toFixed(1)} miles
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {shop.city}, {shop.state}
                    </CardDescription>
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
                    </div>
                    {shop.shop_description && (
                      <p className="mt-4 text-sm">{shop.shop_description}</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    {registeredShops.includes(shop.id) ? (
                      <Button className="w-full" variant="outline" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registered
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleRegister(shop.id)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Register
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
