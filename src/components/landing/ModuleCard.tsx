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
  price?: string;
}

export function ModuleCard({ slug, name, description, icon: Icon, color, price }: ModuleCardProps) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <Badge className="absolute top-2 right-2 md:top-3 md:right-3 bg-green-500 hover:bg-green-600 text-[10px] md:text-xs px-1.5 py-0.5 md:px-2.5 md:py-0.5">
        Available
      </Badge>
      <CardContent className="pt-5 pb-4 px-4 md:pt-8 md:pb-6 md:px-6">
        <div 
          className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4 ${color}`}
        >
          <Icon className="h-5 w-5 md:h-7 md:w-7 text-white" />
        </div>
        <h3 className="text-sm md:text-xl font-semibold mb-1 md:mb-2 line-clamp-1">{name}</h3>
        <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 min-h-[32px] md:min-h-[40px]">
          {description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm md:text-lg font-bold text-primary">{price}</span>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-xs md:text-sm h-7 md:h-9 px-2 md:px-3"
          >
            <Link to={`/modules/${slug}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
