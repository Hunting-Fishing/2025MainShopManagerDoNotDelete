import React from 'react';
import { Shield, Clock, Users, Zap } from 'lucide-react';

const indicators = [
  { icon: Users, label: '500+', sublabel: 'Businesses Served' },
  { icon: Zap, label: '50+', sublabel: 'Industry Modules' },
  { icon: Clock, label: '24/7', sublabel: 'Support Available' },
  { icon: Shield, label: '99.9%', sublabel: 'Uptime Guaranteed' },
];

export function TrustIndicators() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-6 md:py-10">
      {indicators.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <item.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <span className="text-xl md:text-2xl font-bold text-foreground">{item.label}</span>
          <span className="text-xs md:text-sm text-muted-foreground">{item.sublabel}</span>
        </div>
      ))}
    </div>
  );
}
