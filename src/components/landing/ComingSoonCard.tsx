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
      <Badge variant="secondary" className="absolute top-3 right-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Coming Soon
      </Badge>
      <CardContent className="pt-8 pb-6 px-6">
        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
          <Icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground/80">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4 min-h-[40px]">
          {description}
        </p>
        <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground hover:text-primary">
          <Bell className="h-4 w-4" />
          Notify Me
        </Button>
      </CardContent>
    </Card>
  );
}
