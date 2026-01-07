import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UPCOMING_MODULES } from '@/config/moduleRoutes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Search, ArrowLeft, Bell, Layers, Grid3X3 } from 'lucide-react';

export default function UpcomingModules() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'category' | 'date'>('category');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    UPCOMING_MODULES.forEach(m => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats).sort();
  }, []);

  const filteredModules = useMemo(() => {
    return UPCOMING_MODULES.filter(module => {
      const matchesSearch = 
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Group modules
  const groupedModules = useMemo(() => {
    return filteredModules.reduce((acc, module) => {
      const key = groupBy === 'category' 
        ? (module.category || 'Other') 
        : (module.expectedDate || 'TBD');
      if (!acc[key]) acc[key] = [];
      acc[key].push(module);
      return acc;
    }, {} as Record<string, typeof UPCOMING_MODULES>);
  }, [filteredModules, groupBy]);

  const sortedGroups = useMemo(() => {
    return Object.keys(groupedModules).sort((a, b) => {
      if (a === 'TBD' || a === 'Other') return 1;
      if (b === 'TBD' || b === 'Other') return -1;
      return a.localeCompare(b);
    });
  }, [groupedModules]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/module-hub" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Module Hub
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-amber-500" />
                Upcoming Modules
              </h1>
              <p className="text-muted-foreground mt-2">
                {UPCOMING_MODULES.length} modules in development across {categories.length} categories
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={groupBy} onValueChange={(v: 'category' | 'date') => setGroupBy(v)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  By Category
                </span>
              </SelectItem>
              <SelectItem value="date">
                <span className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  By Release
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-600">{UPCOMING_MODULES.length}</div>
              <p className="text-sm text-muted-foreground">Total Upcoming</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {UPCOMING_MODULES.filter(m => m.expectedDate?.includes('Q2 2026')).length}
              </div>
              <p className="text-sm text-muted-foreground">Coming Q2 2026</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{filteredModules.length}</div>
              <p className="text-sm text-muted-foreground">Showing</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        {sortedGroups.map(group => (
          <section key={group} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">{group}</h2>
              <Badge variant="secondary">{groupedModules[group].length}</Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedModules[group].map(module => {
                const Icon = module.icon;
                return (
                  <Card 
                    key={module.slug} 
                    className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${module.gradientFrom} ${module.gradientTo} shadow-md`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                          {module.expectedDate || 'TBD'}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-3">{module.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm mb-3 line-clamp-2">
                        {module.description}
                      </CardDescription>
                      <Button variant="outline" size="sm" className="w-full gap-2 text-xs" disabled>
                        <Bell className="h-3 w-3" />
                        Notify Me
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No modules found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-4">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}