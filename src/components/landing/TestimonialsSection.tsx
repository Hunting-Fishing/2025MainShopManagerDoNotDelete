import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "All Business 365 transformed how we manage our auto shop. Everything is in one place now!",
    author: "Marcus Johnson",
    role: "Owner, Johnson's Auto Repair",
    rating: 5,
  },
  {
    quote: "The marine module is exactly what our yacht club needed. Setup took less than an hour.",
    author: "Sarah Chen",
    role: "Manager, Coastal Marina",
    rating: 5,
  },
  {
    quote: "Finally, software that understands the funeral industry. Compassionate and professional.",
    author: "Robert Williams",
    role: "Director, Williams Memorial",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-10 md:py-16">
      <div className="text-center mb-6 md:mb-10">
        <h3 className="text-xl md:text-3xl font-bold mb-2">Trusted by Businesses Everywhere</h3>
        <p className="text-muted-foreground text-sm md:text-base">See what our customers have to say</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 pb-5 px-5">
              <Quote className="h-6 w-6 text-primary/20 absolute top-4 right-4" />
              
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-sm md:text-base text-foreground/90 mb-4 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="border-t pt-3">
                <p className="font-semibold text-sm">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
