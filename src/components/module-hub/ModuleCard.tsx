import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleRouteConfig } from '@/config/moduleRoutes';

interface ModuleCardProps {
  module: ModuleRouteConfig;
  hasAccess: boolean;
  isSubscribed: boolean;
  onSubscribe?: () => void;
  isLoading?: boolean;
}

export function ModuleCard({ 
  module, 
  hasAccess, 
  isSubscribed, 
  onSubscribe,
  isLoading 
}: ModuleCardProps) {
  const navigate = useNavigate();
  const IconComponent = module.icon;

  const handleEnter = () => {
    if (hasAccess) {
      navigate(module.dashboardRoute);
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        hasAccess 
          ? "cursor-pointer hover:-translate-y-1" 
          : "opacity-75"
      )}
      onClick={hasAccess ? handleEnter : undefined}
    >
      {/* Gradient accent bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        module.gradientFrom,
        module.gradientTo
      )} />

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
            module.gradientFrom,
            module.gradientTo
          )}>
            <IconComponent className="w-7 h-7 text-white" />
          </div>

          {/* Status badge */}
          {hasAccess ? (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Check className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {module.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {module.description}
        </p>

        {/* Action */}
        {hasAccess ? (
          <Button 
            className={cn(
              "w-full group/btn bg-gradient-to-r",
              module.gradientFrom,
              module.gradientTo,
              "hover:opacity-90 transition-opacity"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleEnter();
            }}
          >
            Enter Module
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onSubscribe?.();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Subscribe to Unlock'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
