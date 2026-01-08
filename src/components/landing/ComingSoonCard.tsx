import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, LucideIcon } from 'lucide-react';

interface ComingSoonCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
}

export function ComingSoonCard({ name, description, icon: Icon }: ComingSoonCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-muted/50 hover:bg-muted/80 transition-all duration-300 hover:-translate-y-1">
      <Badge variant="secondary" className="absolute top-2 right-2 md:top-3 md:right-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] md:text-xs px-1.5 py-0.5 md:px-2.5 md:py-0.5">
        Soon
      </Badge>
      <CardContent className="pt-5 pb-4 px-4 md:pt-8 md:pb-6 md:px-6">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-muted flex items-center justify-center mb-2 md:mb-4 group-hover:bg-primary/10 transition-colors">
          <Icon className="h-5 w-5 md:h-7 md:w-7 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-sm md:text-xl font-semibold mb-1 md:mb-2 text-foreground/80 line-clamp-1">{name}</h3>
        <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 min-h-[32px] md:min-h-[40px]">
          {description}
        </p>
        <Button size="sm" variant="ghost" className="gap-1.5 md:gap-2 text-muted-foreground hover:text-primary text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">
          <Bell className="h-3 w-3 md:h-4 md:w-4" />
          Notify
        </Button>
      </CardContent>
    </Card>
  );
}
