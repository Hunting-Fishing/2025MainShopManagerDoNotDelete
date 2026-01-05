import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, Wrench, Car, Droplets, Target, Anchor,
  Home, Sparkles, TreePine, Scissors, Flame, Trees,
  ArrowRight
} from 'lucide-react';
import { ModuleCard } from '@/components/landing/ModuleCard';
import { ComingSoonCard } from '@/components/landing/ComingSoonCard';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { PricingSection } from '@/components/landing/PricingSection';

const availableModules = [
  {
    name: 'Repair Shop',
    description: 'Complete automotive service management with work orders, parts, and more',
    icon: Car,
    color: 'bg-blue-500',
    price: '$49/mo'
  },
  {
    name: 'Power Washing',
    description: 'Manage residential and commercial pressure washing jobs',
    icon: Droplets,
    color: 'bg-cyan-500',
    price: '$39/mo'
  },
  {
    name: 'Gunsmith',
    description: 'Firearm repair, maintenance tracking, and FFL compliance',
    icon: Target,
    color: 'bg-amber-500',
    price: '$49/mo'
  },
  {
    name: 'Marine Services',
    description: 'Boat repair, maintenance, and marina service management',
    icon: Anchor,
    color: 'bg-teal-500',
    price: '$49/mo'
  }
];

const comingSoonModules = [
  {
    name: 'Housekeeping',
    description: 'Residential and commercial cleaning service management',
    icon: Home
  },
  {
    name: 'Carpet Cleaning',
    description: 'Professional carpet and upholstery care scheduling',
    icon: Sparkles
  },
  {
    name: 'Firewood',
    description: 'Firewood sales, delivery, and inventory tracking',
    icon: TreePine
  },
  {
    name: 'Seamstress',
    description: 'Alterations, repairs, and custom clothing orders',
    icon: Scissors
  },
  {
    name: 'Welding',
    description: 'Metal fabrication and repair service management',
    icon: Flame
  },
  {
    name: 'Landscaping',
    description: 'Lawn care, design, and maintenance scheduling',
    icon: Trees
  }
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">ServicePro Hub</h1>
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
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Industry-specific solutions ready to deploy today
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {availableModules.map((module) => (
              <ModuleCard key={module.name} {...module} />
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Modules */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {comingSoonModules.map((module) => (
              <ComingSoonCard key={module.name} {...module} />
            ))}
          </div>
        </div>
      </section>

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
            Join thousands of service professionals who trust ServicePro Hub to run their operations.
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
              <h3 className="text-xl font-bold mb-2">ServicePro Hub</h3>
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
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ServicePro Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
