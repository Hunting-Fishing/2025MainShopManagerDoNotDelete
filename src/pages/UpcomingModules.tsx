import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UPCOMING_MODULES } from '@/config/moduleRoutes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Search, ArrowLeft, Bell, Calendar } from 'lucide-react';

export default function UpcomingModules() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = UPCOMING_MODULES.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group modules by expected date
  const groupedModules = filteredModules.reduce((acc, module) => {
    const date = module.expectedDate || 'TBD';
    if (!acc[date]) acc[date] = [];
    acc[date].push(module);
    return acc;
  }, {} as Record<string, typeof UPCOMING_MODULES>);

  const sortedDates = Object.keys(groupedModules).sort((a, b) => {
    if (a === 'TBD') return 1;
    if (b === 'TBD') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
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
                Explore all the modules we're working on. {UPCOMING_MODULES.length} modules in development.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
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
              <div className="text-2xl font-bold text-green-600">
                {UPCOMING_MODULES.filter(m => m.expectedDate?.includes('Q1') || m.expectedDate?.includes('Q2')).length}
              </div>
              <p className="text-sm text-muted-foreground">Coming H1 2026</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {UPCOMING_MODULES.filter(m => m.expectedDate?.includes('Q3') || m.expectedDate?.includes('Q4')).length}
              </div>
              <p className="text-sm text-muted-foreground">Coming H2 2026</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">
                {UPCOMING_MODULES.filter(m => m.expectedDate?.includes('2027') || m.expectedDate === 'TBD').length}
              </div>
              <p className="text-sm text-muted-foreground">2027 & Beyond</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules by Release Date */}
        {sortedDates.map(date => (
          <section key={date} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{date}</h2>
              <Badge variant="secondary">{groupedModules[date].length} modules</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedModules[date].map(module => {
                const Icon = module.icon;
                return (
                  <Card 
                    key={module.slug} 
                    className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity" 
                         style={{ backgroundImage: `linear-gradient(135deg, var(--primary) 0%, transparent 100%)` }} 
                    />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${module.gradientFrom} ${module.gradientTo} shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                          {module.expectedDate || 'TBD'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-4">{module.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm mb-4">
                        {module.description}
                      </CardDescription>
                      <Button variant="outline" size="sm" className="w-full gap-2" disabled>
                        <Bell className="h-4 w-4" />
                        Notify Me When Available
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
            <p className="text-muted-foreground">
              Try adjusting your search query.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}