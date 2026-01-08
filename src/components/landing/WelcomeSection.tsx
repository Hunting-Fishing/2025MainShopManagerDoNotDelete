import React from 'react';
import { Sparkles, Heart, Clock, Shield } from 'lucide-react';

const benefits = [
  {
    icon: Heart,
    title: 'Built for You',
    description: 'Designed for real service businesses, not generic software.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Automate scheduling, invoicing, and customer follow-ups.',
  },
  {
    icon: Shield,
    title: 'Reliable & Secure',
    description: 'Your data is protected and always accessible.',
  },
  {
    icon: Sparkles,
    title: 'Easy to Start',
    description: 'No setup fees, no long contracts. Start in minutes.',
  },
];

export function WelcomeSection() {
  return (
    <section id="explore" className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Find What's Right for Your Business
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Browse our industry solutions below. Each one is tailored to help you 
            run your business smoothly — pick what fits, skip what doesn't.
          </p>
        </div>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit) => (
            <div 
              key={benefit.title} 
              className="text-center p-4 md:p-6 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-1">{benefit.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
