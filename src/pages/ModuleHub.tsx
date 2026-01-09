import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useModuleAccess } from '@/hooks/useModuleSubscriptions';
import { getAllModuleRoutes, UPCOMING_MODULES } from '@/config/moduleRoutes';
import { ModuleCard } from '@/components/module-hub/ModuleCard';
import { ModuleHubHeader } from '@/components/module-hub/ModuleHubHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LayoutGrid, Sparkles, Search, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function ModuleHub() {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const { 
    hasModuleAccess, 
    trialActive, 
    trialEndsAt, 
    subscriptions,
    isLoading 
  } = useModuleAccess();

  const allModules = getAllModuleRoutes();

  // Group upcoming modules by category
  const upcomingByCategory = useMemo(() => {
    const grouped: Record<string, typeof UPCOMING_MODULES> = {};
    UPCOMING_MODULES.forEach(module => {
      const category = module.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(module);
    });
    return grouped;
  }, []);

  const categoryOrder = Object.keys(upcomingByCategory).sort();
  
  // Filter function for modules
  const filterModules = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return { accessible: [], locked: [], upcoming: [], upcomingByCategory: {}, hasResults: false, isSearching: false };
    
    const matchScore = (name: string, description: string, category?: string) => {
      const nameLower = name.toLowerCase();
      const descLower = description.toLowerCase();
      const catLower = (category || '').toLowerCase();
      
      // Exact match in name gets highest score
      if (nameLower === query) return 100;
      // Starts with query
      if (nameLower.startsWith(query)) return 80;
      // Contains query in name
      if (nameLower.includes(query)) return 60;
      // Contains query in category
      if (catLower.includes(query)) return 50;
      // Contains query in description
      if (descLower.includes(query)) return 40;
      // Partial word match
      const words = query.split(' ');
      const matchedWords = words.filter(w => nameLower.includes(w) || descLower.includes(w) || catLower.includes(w));
      if (matchedWords.length > 0) return 20 * (matchedWords.length / words.length);
      
      return 0;
    };

    const accessibleModules = allModules
      .filter(m => hasModuleAccess(m.slug))
      .map(m => ({ ...m, score: matchScore(m.name, m.description) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);

    const lockedModules = allModules
      .filter(m => !hasModuleAccess(m.slug))
      .map(m => ({ ...m, score: matchScore(m.name, m.description) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);

    const upcomingModules = UPCOMING_MODULES
      .map(m => ({ ...m, score: matchScore(m.name, m.description, m.category) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);

    // Group filtered upcoming by category
    const filteredUpcomingByCategory: Record<string, typeof upcomingModules> = {};
    upcomingModules.forEach(module => {
      const category = module.category || 'Other';
      if (!filteredUpcomingByCategory[category]) {
        filteredUpcomingByCategory[category] = [];
      }
      filteredUpcomingByCategory[category].push(module);
    });

    return {
      accessible: accessibleModules,
      locked: lockedModules,
      upcoming: upcomingModules,
      upcomingByCategory: filteredUpcomingByCategory,
      hasResults: accessibleModules.length > 0 || lockedModules.length > 0 || upcomingModules.length > 0,
      isSearching: true
    };
  }, [searchQuery, allModules, hasModuleAccess]);

  // Default modules when not searching
  const accessibleModules = allModules.filter(m => hasModuleAccess(m.slug));
  const lockedModules = allModules.filter(m => !hasModuleAccess(m.slug));

  // Determine what to display
  const isSearching = searchQuery.trim().length > 0;
  const displayAccessible = isSearching ? filterModules.accessible : accessibleModules;
  const displayLocked = isSearching ? filterModules.locked : lockedModules;
  const displayUpcomingByCategory = isSearching ? filterModules.upcomingByCategory : upcomingByCategory;
  const displayUpcomingCategories = Object.keys(displayUpcomingByCategory).sort();

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const expandAllCategories = () => {
    const allExpanded: Record<string, boolean> = {};
    displayUpcomingCategories.forEach(cat => {
      allExpanded[cat] = true;
    });
    setExpandedCategories(allExpanded);
  };

  const collapseAllCategories = () => {
    setExpandedCategories({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalUpcoming = Object.values(displayUpcomingByCategory).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <ModuleHubHeader 
          userName={user?.user_metadata?.first_name || user?.email?.split('@')[0]}
          trialActive={trialActive}
          trialEndsAt={trialEndsAt}
        />

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search modules... (e.g., auto repair, plumbing, salon)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isSearching && (
            <p className="text-sm text-muted-foreground mt-2">
              {filterModules.hasResults 
                ? `Found ${displayAccessible.length + displayLocked.length + totalUpcoming} matching modules`
                : 'No modules found. Try a different search term.'
              }
            </p>
          )}
        </div>

        {/* No Results State */}
        {isSearching && !filterModules.hasResults && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No modules found</h3>
            <p className="text-muted-foreground mb-4">
              Try searching with different keywords like "repair", "fleet", or "salon"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Your Modules Section */}
        {displayAccessible.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Your Modules</h2>
              <span className="text-sm text-muted-foreground">
                ({displayAccessible.length} {isSearching ? 'found' : 'active'})
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayAccessible.map(module => (
                <ModuleCard
                  key={module.slug}
                  module={module}
                  hasAccess={true}
                  isSubscribed={subscriptions.some(s => s.module_slug === module.slug)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Modules Section */}
        {displayLocked.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">Available Modules</h2>
              <span className="text-sm text-muted-foreground">
                ({displayLocked.length} {isSearching ? 'found' : 'available'})
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayLocked.map(module => (
                <ModuleCard
                  key={module.slug}
                  module={module}
                  hasAccess={false}
                  isSubscribed={false}
                  onViewPlans={() => navigate(`/modules/${module.slug}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Modules Section - Categorized */}
        {displayUpcomingCategories.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-foreground">Upcoming Modules</h2>
                <Badge variant="secondary" className="text-xs">
                  {totalUpcoming} {isSearching ? 'Found' : 'Coming Soon'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={expandAllCategories}>
                  Expand All
                </Button>
                <Button variant="ghost" size="sm" onClick={collapseAllCategories}>
                  Collapse All
                </Button>
                {!isSearching && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/upcoming-modules">View All</Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {displayUpcomingCategories.map(category => {
                const modules = displayUpcomingByCategory[category];
                const isExpanded = expandedCategories[category] || false;
                
                return (
                  <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors text-left">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="font-medium text-foreground">{category}</span>
                          <Badge variant="outline" className="text-xs">
                            {modules.length} module{modules.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-8">
                        {modules.map(module => {
                          const Icon = module.icon;
                          return (
                            <Card key={module.slug} className="relative overflow-hidden border-dashed opacity-80 hover:opacity-100 transition-opacity">
                              <div className="absolute top-3 right-3">
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                                  {module.expectedDate || 'Coming Soon'}
                                </Badge>
                              </div>
                              <CardHeader className="pb-2 pt-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${module.gradientFrom} ${module.gradientTo} mb-2`}>
                                  <Icon className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-base">{module.name}</CardTitle>
                              </CardHeader>
                              <CardContent className="pb-4">
                                <CardDescription className="text-xs line-clamp-2">
                                  {module.description}
                                </CardDescription>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State - only show when not searching */}
        {!isSearching && accessibleModules.length === 0 && lockedModules.length === 0 && (
          <div className="text-center py-16">
            <LayoutGrid className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No modules available</h3>
            <p className="text-muted-foreground">
              Please contact support if you believe this is an error.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
