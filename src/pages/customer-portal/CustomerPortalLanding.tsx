import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, KeyRound, Building2, Crosshair, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { getShopBySlug, getShopByInviteCode, searchShops, ShopPublicInfo } from '@/services/shopLookupService';
import { useToast } from '@/hooks/use-toast';

type ConnectionMethod = 'code' | 'search' | null;

export default function CustomerPortalLanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<ShopPublicInfo | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<ConnectionMethod>(null);
  
  // Invite code form
  const [inviteCode, setInviteCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  
  // Search form
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ShopPublicInfo[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Check for shop context from URL params
  useEffect(() => {
    const checkShopContext = async () => {
      const shopSlug = searchParams.get('shop');
      const code = searchParams.get('code');
      
      if (shopSlug) {
        const shopData = await getShopBySlug(shopSlug);
        if (shopData) {
          setShop(shopData);
        }
      } else if (code) {
        const shopData = await getShopByInviteCode(code);
        if (shopData) {
          setShop(shopData);
        }
      }
      
      setLoading(false);
    };
    
    checkShopContext();
  }, [searchParams]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    setCodeLoading(true);
    const shopData = await getShopByInviteCode(inviteCode);
    setCodeLoading(false);
    
    if (shopData) {
      setShop(shopData);
      setConnectionMethod(null);
    } else {
      toast({
        title: "Invalid Code",
        description: "We couldn't find a business with that code. Please check and try again.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    const results = await searchShops(searchQuery);
    setSearchResults(results);
    setSearchLoading(false);
  };

  const selectShop = (selectedShop: ShopPublicInfo) => {
    setShop(selectedShop);
    setConnectionMethod(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  const proceedToRegister = () => {
    if (shop) {
      navigate(`/customer-portal/register?shop=${shop.slug}`);
    } else {
      navigate('/customer-portal/register');
    }
  };

  const proceedToLogin = () => {
    if (shop) {
      navigate(`/customer-portal/login?shop=${shop.slug}`);
    } else {
      navigate('/customer-portal/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // If we have a shop context, show business-branded welcome
  if (shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-amber-200">
          <CardHeader className="text-center space-y-4">
            {shop.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt={shop.name} 
                className="w-20 h-20 mx-auto object-contain rounded-lg"
              />
            ) : (
              <div className="mx-auto w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl font-bold text-amber-900">
                {shop.name}
              </CardTitle>
              <CardDescription className="text-amber-700 mt-2">
                Welcome to our Customer Portal
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground text-sm">
              Create an account or sign in to book services, view your service history, and manage your account.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={proceedToRegister}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </Button>
              
              <Button 
                onClick={proceedToLogin}
                variant="outline"
                className="w-full border-amber-300 hover:bg-amber-50"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground"
                onClick={() => setShop(null)}
              >
                Looking for a different business?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No shop context - show connection options
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-lg shadow-xl border-amber-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mb-2">
            <Crosshair className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-900">
            Customer Portal
          </CardTitle>
          <CardDescription className="text-amber-700">
            Connect with your service provider to book services and manage your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {connectionMethod === null && (
            <div className="space-y-3">
              <Button 
                onClick={() => setConnectionMethod('code')}
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 border-amber-200 hover:bg-amber-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <KeyRound className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">I have a business code</div>
                    <div className="text-sm text-muted-foreground">Enter the code from your service provider</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
              
              <Button 
                onClick={() => setConnectionMethod('search')}
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 border-amber-200 hover:bg-amber-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Search className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Find a business</div>
                    <div className="text-sm text-muted-foreground">Search our directory of service providers</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
              
              <div className="pt-4 border-t">
                <p className="text-center text-sm text-muted-foreground mb-3">
                  Already have an account?
                </p>
                <Button 
                  onClick={() => navigate('/customer-portal/login')}
                  variant="ghost"
                  className="w-full"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          )}
          
          {connectionMethod === 'code' && (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setConnectionMethod(null)}
                className="mb-2"
              >
                ← Back
              </Button>
              
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter Business Code</label>
                  <Input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="e.g., BUCKS1"
                    className="text-center text-lg tracking-widest uppercase border-amber-200 focus:border-amber-500"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    This code should be on your receipt, business card, or advertisement
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={codeLoading || !inviteCode.trim()}
                >
                  {codeLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Find Business'
                  )}
                </Button>
              </form>
            </div>
          )}
          
          {connectionMethod === 'search' && (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setConnectionMethod(null);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="mb-2"
              >
                ← Back
              </Button>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Search for a Business</label>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Business name..."
                    className="border-amber-200 focus:border-amber-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    onClick={handleSearch}
                    className="bg-amber-600 hover:bg-amber-700"
                    disabled={searchLoading}
                  >
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectShop(result)}
                      className="w-full p-3 text-left border rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors"
                    >
                      <div className="font-medium">{result.name}</div>
                      {result.city && result.state && (
                        <div className="text-sm text-muted-foreground">
                          {result.city}, {result.state}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {searchQuery && searchResults.length === 0 && !searchLoading && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No businesses found. Try a different search term.
                </p>
              )}
            </div>
          )}
          
          <div className="text-center pt-4">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-amber-600"
            >
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
