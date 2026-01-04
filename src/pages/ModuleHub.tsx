import React from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useModuleAccess, useSubscribeToModule } from '@/hooks/useModuleSubscriptions';
import { MODULE_ROUTES, getAllModuleRoutes } from '@/config/moduleRoutes';
import { ModuleCard } from '@/components/module-hub/ModuleCard';
import { ModuleHubHeader } from '@/components/module-hub/ModuleHubHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid } from 'lucide-react';

export default function ModuleHub() {
  const { user } = useAuthUser();
  const { 
    hasModuleAccess, 
    trialActive, 
    trialEndsAt, 
    subscriptions,
    isLoading 
  } = useModuleAccess();
  const subscribeMutation = useSubscribeToModule();

  const allModules = getAllModuleRoutes();
  
  // Separate modules by access
  const accessibleModules = allModules.filter(m => hasModuleAccess(m.slug));
  const lockedModules = allModules.filter(m => !hasModuleAccess(m.slug));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <ModuleHubHeader 
          userName={user?.user_metadata?.first_name || user?.email?.split('@')[0]}
          trialActive={trialActive}
          trialEndsAt={trialEndsAt}
        />

        {/* Your Modules Section */}
        {accessibleModules.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Your Modules</h2>
              <span className="text-sm text-muted-foreground">
                ({accessibleModules.length} active)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accessibleModules.map(module => (
                <ModuleCard
                  key={module.slug}
                  module={module}
                  hasAccess={true}
                  isSubscribed={subscriptions.some(s => s.module_slug === module.slug)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Modules Section */}
        {lockedModules.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">Available Modules</h2>
              <span className="text-sm text-muted-foreground">
                ({lockedModules.length} available)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedModules.map(module => (
                <ModuleCard
                  key={module.slug}
                  module={module}
                  hasAccess={false}
                  isSubscribed={false}
                  onSubscribe={() => subscribeMutation.mutate(module.slug)}
                  isLoading={subscribeMutation.isPending}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {accessibleModules.length === 0 && lockedModules.length === 0 && (
          <div className="text-center py-16">
            <LayoutGrid className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No modules available</h3>
            <p className="text-muted-foreground">
              Please contact support if you believe this is an error.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
