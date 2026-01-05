import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PricingSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the modules you need. Pay only for what you use.
          </p>
        </div>
        
        <Card className="max-w-2xl mx-auto overflow-hidden border-2 border-primary/20">
          <div className="bg-primary/5 p-6 text-center border-b">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              14-Day Free Trial
            </div>
            <h3 className="text-2xl font-bold">Start Free, Scale As You Grow</h3>
          </div>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">What's included:</h4>
                <ul className="space-y-3">
                  {[
                    'Full access to all module features',
                    'Unlimited customers & work orders',
                    'Team collaboration tools',
                    'Mobile-friendly dashboard',
                    'Email & chat support',
                    'Regular updates & new features'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center items-center text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">$39-49</span>
                  <span className="text-muted-foreground">/month per module</span>
                </div>
                <Link to="/staff-login">
                  <Button size="lg" className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  No credit card required
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
