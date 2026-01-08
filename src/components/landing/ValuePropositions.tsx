import React from 'react';
import { Check, CreditCard, Rocket, Calendar, HeartHandshake } from 'lucide-react';

const propositions = [
  { icon: CreditCard, text: 'No Credit Card Required' },
  { icon: Rocket, text: 'Setup in 5 Minutes' },
  { icon: Calendar, text: 'Free 14-Day Trial' },
  { icon: HeartHandshake, text: 'Cancel Anytime' },
];

export function ValuePropositions() {
  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-6 py-4 md:py-6">
      {propositions.map((prop, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full bg-green-500/10 border border-green-500/20"
        >
          <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium text-green-700 dark:text-green-300 whitespace-nowrap">
            {prop.text}
          </span>
        </div>
      ))}
    </div>
  );
}
