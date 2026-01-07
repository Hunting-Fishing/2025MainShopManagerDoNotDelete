import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Wrench, ArrowRight } from 'lucide-react';
import { SearchInput } from '@/components/settings/SearchInput';
import { ModuleCard } from '@/components/landing/ModuleCard';
import { ComingSoonCard } from '@/components/landing/ComingSoonCard';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { PricingSection } from '@/components/landing/PricingSection';
import { LANDING_COMING_SOON_CATEGORIES, LANDING_MODULES } from '@/config/landingModules';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');

  // Keyword associations for smart search
  const keywordAssociations: Record<string, string[]> = {
    eye: ['lash', 'lashes', 'brow', 'brows', 'optometry', 'vision', 'optical', 'eyewear', 'glasses', 'contacts'],
    lash: ['eye', 'esthetician', 'beauty', 'extensions'],
    brow: ['eye', 'esthetician', 'beauty', 'wax', 'threading'],
    hair: ['salon', 'barber', 'stylist', 'cut', 'color', 'beauty'],
    skin: ['facial', 'esthetician', 'spa', 'derma', 'beauty', 'wax'],
    pet: ['dog', 'cat', 'vet', 'veterinary', 'grooming', 'animal', 'boarding', 'kennel'],
    dog: ['pet', 'grooming', 'walking', 'training', 'boarding', 'kennel'],
    cat: ['pet', 'grooming', 'boarding', 'sitting'],
    car: ['auto', 'vehicle', 'repair', 'mechanic', 'tire', 'oil', 'detailing', 'wash'],
    auto: ['car', 'vehicle', 'repair', 'mechanic', 'automotive'],
    food: ['restaurant', 'catering', 'bakery', 'cafe', 'kitchen', 'chef', 'meal'],
    clean: ['cleaning', 'maid', 'janitorial', 'housekeeping', 'pressure', 'wash'],
    health: ['medical', 'therapy', 'wellness', 'clinic', 'doctor', 'nurse', 'care'],
    beauty: ['salon', 'spa', 'nail', 'hair', 'lash', 'brow', 'esthetician', 'makeup'],
    home: ['house', 'residential', 'property', 'renovation', 'repair', 'maintenance'],
    tech: ['computer', 'phone', 'IT', 'repair', 'software', 'electronic'],
    fitness: ['gym', 'training', 'workout', 'personal', 'yoga', 'pilates'],
    wedding: ['bridal', 'event', 'photography', 'catering', 'florist', 'venue'],
    lawn: ['landscape', 'garden', 'mowing', 'yard', 'grass', 'tree'],
    pool: ['swimming', 'spa', 'hot tub', 'maintenance', 'cleaning'],
  };

  // Get expanded search terms including associations
  const getExpandedTerms = (query: string): string[] => {
    const lowerQuery = query.toLowerCase().trim();
    const terms = [lowerQuery];
    
    // Add associated keywords
    Object.entries(keywordAssociations).forEach(([key, associations]) => {
      if (lowerQuery.includes(key)) {
        terms.push(...associations);
      }
      // Also check if query matches any association
      if (associations.some(assoc => lowerQuery.includes(assoc))) {
        terms.push(key);
      }
    });
    
    return [...new Set(terms)];
  };

  // Smart search matching with relevance scoring
  const matchScore = (text: string, query: string): number => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    if (lowerText === lowerQuery) return 100;
    if (lowerText.startsWith(lowerQuery)) return 80;
    if (lowerText.includes(lowerQuery)) return 60;
    // Fuzzy match - check if all words in query appear
    const queryWords = lowerQuery.split(/\s+/);
    const allWordsMatch = queryWords.every(word => lowerText.includes(word));
    if (allWordsMatch) return 40;
    return 0;
  };

  // Enhanced match with keyword associations
  const smartMatchScore = (text: string, query: string): number => {
    const directScore = matchScore(text, query);
    if (directScore > 0) return directScore;
    
    // Check expanded terms
    const expandedTerms = getExpandedTerms(query);
    let bestScore = 0;
    for (const term of expandedTerms) {
      const score = matchScore(text, term);
      if (score > bestScore) bestScore = score;
    }
    // Reduce score for association matches (less relevant than direct)
    return bestScore * 0.7;
  };

  // Filter available modules
  const filteredAvailableModules = useMemo(() => {
    const available = LANDING_MODULES.filter((module) => module.available);
    if (!searchQuery.trim()) return available;

    return available
      .map(module => ({
        module,
        score: Math.max(
          smartMatchScore(module.name, searchQuery) * 2,
          smartMatchScore(module.description, searchQuery)
        )
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.module);
  }, [searchQuery]);

  // Filter coming soon categories and modules
  const filteredComingSoonCategories = useMemo(() => {
    if (!searchQuery.trim()) return LANDING_COMING_SOON_CATEGORIES;

    return LANDING_COMING_SOON_CATEGORIES.map(category => {
      const filteredModules = category.modules
        .map(module => ({
          module,
          score: Math.max(
            smartMatchScore(module.name, searchQuery) * 2,
            smartMatchScore(module.description, searchQuery),
            smartMatchScore(category.category, searchQuery) * 0.5
          )
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.module);

      return { ...category, modules: filteredModules };
    }).filter(category => category.modules.length > 0);
  }, [searchQuery]);

  const totalResults = filteredAvailableModules.length + 
    filteredComingSoonCategories.reduce((acc, cat) => acc + cat.modules.length, 0);

  return (
    <div className="min-h-screen bg-background font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">All Business 365</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Professional Service Management</p>
            </div>
            <div className="flex gap-3">
              <Link to="/customer-portal/login">
                <Button variant="ghost" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Customer</span> Portal
                </Button>
              </Link>
              <Link to="/staff-login">
                <Button className="gap-2">
                  <Wrench className="h-4 w-4" />
                  <span className="hidden sm:inline">Staff</span> Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            One Platform.
            <span className="text-primary block mt-2">Unlimited Possibilities.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Manage customers, work orders, scheduling, invoicing, and team members across 
            <strong className="text-foreground"> any service industry</strong>. 
            Built for professionals who demand more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/staff-login">
              <Button size="lg" className="gap-2 text-lg px-8">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#modules">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explore Modules
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Available Modules */}
      <section id="modules" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Available Modules
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Industry-specific solutions ready to deploy today
            </p>
            
            {/* Search Input */}
            <div className="flex justify-center mb-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search all modules..."
                className="max-w-lg"
              />
            </div>
            
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Found {totalResults} module{totalResults !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            )}
          </div>

          {filteredAvailableModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {filteredAvailableModules.map((module) => (
                <ModuleCard key={module.slug} {...module} />
              ))}
            </div>
          ) : searchQuery && (
            <p className="text-center text-muted-foreground">No available modules match your search.</p>
          )}
        </div>
      </section>

      {/* Coming Soon Modules */}
      {filteredComingSoonCategories.length > 0 && (
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Coming Soon
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                New modules in development. Get notified when they launch.
              </p>
            </div>
            
            {/* Categorized Coming Soon Modules */}
            <div className="space-y-16 max-w-6xl mx-auto">
              {filteredComingSoonCategories.map((category) => (
                <div key={category.category}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {category.category}
                    </h3>
                    <p className="text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.modules.map((module) => (
                      <ComingSoonCard key={module.name} {...module} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <FeatureGrid />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of service professionals who trust All Business 365 to run their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/staff-login">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/customer-portal-login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Customer Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-2">All Business 365</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Professional service management platform for any industry. 
                Streamline your operations and grow your business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#modules" className="hover:text-foreground transition-colors">Modules</a></li>
                <li><Link to="/staff-login" className="hover:text-foreground transition-colors">Staff Portal</Link></li>
                <li><Link to="/customer-portal-login" className="hover:text-foreground transition-colors">Customer Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><Link to="/affiliate-verify" className="hover:text-foreground transition-colors">Affiliate Verification</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} All Business 365. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
