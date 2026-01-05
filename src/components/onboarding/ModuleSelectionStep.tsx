import { Check, Sparkles, Car, Droplets, Target, Anchor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MODULE_CONFIGS, ModuleConfig } from '@/config/moduleSubscriptions';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Car,
  Droplets,
  Target,
  Anchor,
};

interface ModuleSelectionStepProps {
  selectedModules: string[];
  onModuleToggle: (slug: string) => void;
  onContinue: () => void;
}

export function ModuleSelectionStep({ 
  selectedModules, 
  onModuleToggle, 
  onContinue 
}: ModuleSelectionStepProps) {
  const modules = Object.values(MODULE_CONFIGS);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          14-Day Free Trial
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Select Your Modules
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Choose the modules you need for your business. All selected modules are included in your free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((module) => {
          const Icon = ICON_MAP[module.icon] || Car;
          const isSelected = selectedModules.includes(module.slug);
          
          return (
            <Card
              key={module.slug}
              onClick={() => onModuleToggle(module.slug)}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-md",
                isSelected 
                  ? "ring-2 ring-primary bg-primary/5 border-primary" 
                  : "hover:border-primary/50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{module.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    ${module.price}/month
                  </Badge>
                  {isSelected && (
                    <span className="text-xs text-primary font-medium">Selected</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedModules.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{selectedModules.length}</span> module{selectedModules.length !== 1 ? 's' : ''} selected
            <span className="mx-2">•</span>
            <span className="text-primary font-medium">Free for 14 days</span>
          </p>
        </div>
      )}

      <Button 
        onClick={onContinue}
        disabled={selectedModules.length === 0}
        className="w-full h-12 text-base"
      >
        Continue to Company Setup
      </Button>
    </div>
  );
}
