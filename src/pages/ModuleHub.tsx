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
import { 
  LayoutGrid, Sparkles, Search, X, ChevronDown, ChevronRight, 
  Home, HardHat, Car, Scissors, Dog, UtensilsCrossed, Monitor, 
  Key, Tractor, Briefcase, Heart, Baby, Rocket, LucideIcon,
  Zap, Flame, Star
} from 'lucide-react';

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; gradient: string; emoji: string }> = {
  'Home & Property Services': { icon: Home, gradient: 'from-blue-500 to-cyan-500', emoji: '🏠' },
  'Construction & Trade': { icon: HardHat, gradient: 'from-orange-500 to-amber-500', emoji: '🏗️' },
  'Automotive & Transportation': { icon: Car, gradient: 'from-red-500 to-pink-500', emoji: '🚗' },
  'Personal Services': { icon: Scissors, gradient: 'from-purple-500 to-violet-500', emoji: '✨' },
  'Pet Services': { icon: Dog, gradient: 'from-amber-500 to-yellow-500', emoji: '🐾' },
  'Food & Beverage': { icon: UtensilsCrossed, gradient: 'from-rose-500 to-orange-500', emoji: '🍽️' },
  'Technology & Electronics': { icon: Monitor, gradient: 'from-indigo-500 to-blue-500', emoji: '💻' },
  'Specialty & Niche': { icon: Key, gradient: 'from-emerald-500 to-teal-500', emoji: '🔑' },
  'Agriculture & Outdoor': { icon: Tractor, gradient: 'from-green-500 to-lime-500', emoji: '🌿' },
  'Professional Services': { icon: Briefcase, gradient: 'from-slate-500 to-gray-600', emoji: '💼' },
  'Healthcare & Wellness': { icon: Heart, gradient: 'from-pink-500 to-rose-500', emoji: '❤️' },
  'Childcare & Education': { icon: Baby, gradient: 'from-pink-400 to-purple-500', emoji: '👶' },
  'Other': { icon: Rocket, gradient: 'from-violet-500 to-purple-600', emoji: '🚀' },
};

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
      
      if (nameLower === query) return 100;
      if (nameLower.startsWith(query)) return 80;
      if (nameLower.includes(query)) return 60;
      if (catLower.includes(query)) return 50;
      if (descLower.includes(query)) return 40;
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

  const accessibleModules = allModules.filter(m => hasModuleAccess(m.slug));
  const lockedModules = allModules.filter(m => !hasModuleAccess(m.slug));

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

        {/* Upcoming Modules Section - Exciting Design */}
        {displayUpcomingCategories.length > 0 && (
          <section className="mb-10">
            {/* Hero Header for Upcoming */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 p-6 md:p-8 mb-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                      Upcoming Modules
                      <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
                    </h2>
                    <p className="text-white/80 text-sm md:text-base mt-1">
                      <span className="font-semibold">{totalUpcoming}</span> exciting modules coming soon across <span className="font-semibold">{displayUpcomingCategories.length}</span> categories
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={expandAllCategories}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    Expand All
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={collapseAllCategories}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    Collapse All
                  </Button>
                  {!isSearching && (
                    <Button variant="secondary" size="sm" asChild className="bg-white text-orange-600 hover:bg-white/90">
                      <Link to="/upcoming-modules">View All</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {displayUpcomingCategories.map((category, idx) => {
                const modules = displayUpcomingByCategory[category];
                const isExpanded = expandedCategories[category] || false;
                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
                const CategoryIcon = config.icon;
                
                return (
                  <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                    <CollapsibleTrigger asChild>
                      <button 
                        className={`group flex items-center justify-between w-full p-4 rounded-xl bg-gradient-to-r ${config.gradient} hover:shadow-lg hover:scale-[1.01] transition-all duration-300 text-left`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CategoryIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-white text-lg flex items-center gap-2">
                              {config.emoji} {category}
                            </span>
                            <span className="text-white/70 text-sm">
                              {modules.length} module{modules.length !== 1 ? 's' : ''} coming soon
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                            {modules.length}
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-white transition-transform" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-2">
                        {modules.map((module, moduleIdx) => {
                          const Icon = module.icon;
                          return (
                            <Card 
                              key={module.slug} 
                              className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                              style={{ animationDelay: `${moduleIdx * 30}ms` }}
                            >
                              {/* Gradient overlay on hover */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${module.gradientFrom} ${module.gradientTo} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                              
                              {/* Expected date badge */}
                              <div className="absolute top-3 right-3">
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs shadow-lg">
                                  <Star className="w-3 h-3 mr-1" />
                                  {module.expectedDate || 'Coming Soon'}
                                </Badge>
                              </div>
                              
                              <CardHeader className="pb-2 pt-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${module.gradientFrom} ${module.gradientTo} mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-base group-hover:text-primary transition-colors">
                                  {module.name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pb-4">
                                <CardDescription className="text-xs line-clamp-2">
                                  {module.description}
                                </CardDescription>
                              </CardContent>
                              
                              {/* Bottom gradient bar */}
                              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${module.gradientFrom} ${module.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
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

        {/* Empty State */}
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
