import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  price: string;
}

export function ModuleCard({ slug, name, description, icon: Icon, color, price }: ModuleCardProps) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
        Available Now
      </Badge>
      <CardContent className="pt-8 pb-6 px-6">
        <div 
          className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${color}`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4 min-h-[40px]">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{price}</span>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <Link to={`/modules/${slug}`}>Learn More</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
