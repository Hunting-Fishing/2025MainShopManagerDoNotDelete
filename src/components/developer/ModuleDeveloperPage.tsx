import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, ShoppingBag, Settings, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ModuleDeveloperPageProps {
  moduleSlug: string;
  moduleName: string;
  moduleIcon: React.ReactNode;
  backRoute: string;
}

export function ModuleDeveloperPage({ 
  moduleSlug, 
  moduleName, 
  moduleIcon,
  backRoute 
}: ModuleDeveloperPageProps) {
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <p className="text-muted-foreground">
              Manage product submissions, affiliate links, and store settings
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
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
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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

      {/* Tabs */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Submissions
            {pendingSubmissions > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingSubmissions}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Affiliate Products
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Shopping Links
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Store Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Submissions</CardTitle>
              <CardDescription>
                User suggestions for products to add to the {moduleName} store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No product submissions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div 
                      key={submission.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{submission.product_name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {submission.notes || 'No notes'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{submission.suggested_category}</span>
                          <span>•</span>
                          <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            submission.status === 'pending' ? 'secondary' :
                            submission.status === 'approved' ? 'default' : 'destructive'
                          }
                        >
                          {submission.status}
                        </Badge>
                        {submission.status === 'pending' && (
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Products</CardTitle>
              <CardDescription>
                Products available in the {moduleName} store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                Affiliate products feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Links</CardTitle>
              <CardDescription>
                Configure affiliate and shopping links for {moduleName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                Shopping link management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Configure store behavior and display options for {moduleName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                Store settings coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
