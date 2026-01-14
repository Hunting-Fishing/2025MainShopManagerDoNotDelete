import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Package, 
  ShoppingBag, 
  Settings, 
  Link as LinkIcon, 
  BarChart3,
  Plus,
  ExternalLink,
  Store,
  Tag,
  Percent,
  DollarSign,
  Globe,
  Trash2,
  Edit,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ModuleDeveloperPageProps {
  moduleSlug: string;
  moduleName: string;
  moduleIcon: React.ReactNode;
  backRoute: string;
}

type ActiveSection = 'overview' | 'shopping' | 'submissions' | 'settings';

export function ModuleDeveloperPage({ 
  moduleSlug, 
  moduleName, 
  moduleIcon,
  backRoute 
}: ModuleDeveloperPageProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');

  // Fetch product submissions for this module
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['product-submissions', moduleSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .eq('module_id', moduleSlug)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;

  const sectionNavItems = [
    { 
      id: 'overview' as const, 
      label: 'Overview', 
      icon: BarChart3, 
      description: 'Dashboard & analytics' 
    },
    { 
      id: 'shopping' as const, 
      label: 'Shopping', 
      icon: ShoppingBag, 
      description: 'Products, links & affiliate settings',
      badge: 'Full Control'
    },
    { 
      id: 'submissions' as const, 
      label: 'Submissions', 
      icon: Package, 
      description: 'User product suggestions',
      badge: pendingSubmissions > 0 ? `${pendingSubmissions} pending` : undefined
    },
    { 
      id: 'settings' as const, 
      label: 'Module Settings', 
      icon: Settings, 
      description: 'Configure module behavior' 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(backRoute)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              {moduleIcon}
              <div>
                <h1 className="text-2xl font-bold">{moduleName} Developer</h1>
                <p className="text-sm text-muted-foreground">
                  Configure and manage all aspects of the {moduleName} module
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Section Navigation Sidebar */}
        <div className="w-72 border-r bg-muted/30 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {sectionNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                  activeSection === item.id 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 mt-0.5 shrink-0",
                  activeSection === item.id ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant={activeSection === item.id ? "secondary" : "outline"} 
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs mt-0.5",
                    activeSection === item.id ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </p>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 mt-0.5 shrink-0",
                  activeSection === item.id ? "text-primary-foreground" : "text-muted-foreground/50"
                )} />
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {activeSection === 'overview' && (
            <OverviewSection 
              moduleName={moduleName}
              submissions={submissions}
              pendingSubmissions={pendingSubmissions}
              approvedSubmissions={approvedSubmissions}
            />
          )}
          {activeSection === 'shopping' && (
            <ShoppingSection moduleName={moduleName} moduleSlug={moduleSlug} />
          )}
          {activeSection === 'submissions' && (
            <SubmissionsSection 
              moduleName={moduleName}
              submissions={submissions}
              isLoading={submissionsLoading}
            />
          )}
          {activeSection === 'settings' && (
            <SettingsSection moduleName={moduleName} moduleSlug={moduleSlug} />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Section Component
function OverviewSection({ 
  moduleName, 
  submissions, 
  pendingSubmissions, 
  approvedSubmissions 
}: { 
  moduleName: string;
  submissions: any[];
  pendingSubmissions: number;
  approvedSubmissions: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">Quick glance at {moduleName} developer metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedSubmissions}</div>
            <p className="text-xs text-muted-foreground">Converted to products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active in store</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates in the {moduleName} module</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((submission) => (
                <div 
                  key={submission.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{submission.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      submission.status === 'pending' ? 'secondary' :
                      submission.status === 'approved' ? 'default' : 'destructive'
                    }
                  >
                    {submission.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Shopping Section Component - Full Featured
function ShoppingSection({ moduleName, moduleSlug }: { moduleName: string; moduleSlug: string }) {
  const [activeTab, setActiveTab] = useState<'products' | 'links' | 'affiliates' | 'categories'>('products');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Shopping Management</h2>
          <p className="text-muted-foreground">
            Complete control over {moduleName} store products, links, and affiliate settings
          </p>
        </div>
      </div>

      {/* Shopping Sub-Navigation */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { id: 'products', label: 'Products', icon: Store },
          { id: 'links', label: 'Shopping Links', icon: LinkIcon },
          { id: 'affiliates', label: 'Affiliate Settings', icon: Percent },
          { id: 'categories', label: 'Categories', icon: Tag },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Store Products</h3>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="py-12 text-center">
                <Store className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add products to your {moduleName} store to start selling
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shopping Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Shopping Links</h3>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Amazon Affiliate
                </CardTitle>
                <CardDescription>Connect Amazon affiliate links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amazon-tag">Amazon Associate Tag</Label>
                  <Input id="amazon-tag" placeholder="your-tag-20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amazon-store">Store ID</Label>
                  <Input id="amazon-store" placeholder="your-store-id" />
                </div>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Amazon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Custom Affiliate Links
                </CardTitle>
                <CardDescription>Add custom shopping links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="link-name">Link Name</Label>
                  <Input id="link-name" placeholder="Partner Store" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-url">Affiliate URL</Label>
                  <Input id="link-url" placeholder="https://partner.com?ref=you" />
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Link
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Existing Links Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configured Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                No shopping links configured yet
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Affiliate Settings Tab */}
      {activeTab === 'affiliates' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Affiliate Settings</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Commission Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-commission">Default Commission Rate (%)</Label>
                  <Input id="default-commission" type="number" placeholder="10" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Tiered Commissions</Label>
                    <p className="text-xs text-muted-foreground">
                      Higher rates for top performers
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Payout Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="min-payout">Minimum Payout ($)</Label>
                  <Input id="min-payout" type="number" placeholder="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-frequency">Payout Frequency</Label>
                  <Input id="payout-frequency" placeholder="Monthly" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Product Categories</h3>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="py-8 text-center text-muted-foreground">
                No categories created yet. Categories help organize products in your store.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Submissions Section Component
function SubmissionsSection({ 
  moduleName, 
  submissions, 
  isLoading 
}: { 
  moduleName: string;
  submissions: any[];
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Product Submissions</h2>
          <p className="text-muted-foreground">
            Review and manage user-submitted product suggestions for {moduleName}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Submissions</h3>
              <p className="text-muted-foreground">
                Users can submit product suggestions from the {moduleName} store
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {submissions.map((submission) => (
                <div 
                  key={submission.id} 
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{submission.product_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {submission.suggested_category || 'Uncategorized'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {submission.notes || 'No additional notes'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(submission.submitted_at).toLocaleDateString()} at{' '}
                      {new Date(submission.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        submission.status === 'pending' ? 'secondary' :
                        submission.status === 'approved' ? 'default' : 'destructive'
                      }
                    >
                      {submission.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Section Component
function SettingsSection({ moduleName, moduleSlug }: { moduleName: string; moduleSlug: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Module Settings</h2>
        <p className="text-muted-foreground">
          Configure behavior and features for the {moduleName} module
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Configuration</CardTitle>
            <CardDescription>General store settings for {moduleName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Store</Label>
                <p className="text-xs text-muted-foreground">
                  Allow users to browse and purchase products
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Product Submissions</Label>
                <p className="text-xs text-muted-foreground">
                  Users can suggest products to add to the store
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Affiliate Badges</Label>
                <p className="text-xs text-muted-foreground">
                  Display affiliate disclosure on products
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Module Features</CardTitle>
            <CardDescription>Enable or disable specific features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Product Reviews</Label>
                <p className="text-xs text-muted-foreground">
                  Allow customers to leave product reviews
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Wishlist</Label>
                <p className="text-xs text-muted-foreground">
                  Let users save products for later
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Price Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify users when prices drop
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Customize how products appear</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="products-per-page">Products Per Page</Label>
              <Input id="products-per-page" type="number" defaultValue="12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-sort">Default Sort Order</Label>
              <Input id="default-sort" placeholder="Newest First" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
