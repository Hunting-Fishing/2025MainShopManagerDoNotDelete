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
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <Badge className="absolute top-1.5 right-1.5 md:top-3 md:right-3 bg-green-500 hover:bg-green-600 text-[8px] md:text-xs px-1 py-0 md:px-2.5 md:py-0.5 h-4 md:h-auto">
        Live
      </Badge>
      <CardContent className="pt-4 pb-3 px-3 md:pt-8 md:pb-6 md:px-6">
        <div 
          className={`w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center mb-1.5 md:mb-4 ${color}`}
        >
          <Icon className="h-4 w-4 md:h-7 md:w-7 text-white" />
        </div>
        <h3 className="text-xs md:text-xl font-semibold mb-0.5 md:mb-2 line-clamp-1">{name}</h3>
        <p className="text-muted-foreground text-[10px] md:text-sm mb-2 md:mb-4 line-clamp-2 min-h-[24px] md:min-h-[40px]">
          {description}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs md:text-lg font-bold text-primary">{price}</span>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-[10px] md:text-sm h-6 md:h-9 px-1.5 md:px-3"
          >
            <Link to={`/modules/${slug}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
