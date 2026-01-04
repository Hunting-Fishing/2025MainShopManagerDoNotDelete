import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, Sparkles } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ModuleHubHeaderProps {
  userName?: string;
  trialActive: boolean;
  trialEndsAt: string | null;
}

export function ModuleHubHeader({ userName, trialActive, trialEndsAt }: ModuleHubHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const daysRemaining = trialEndsAt 
    ? differenceInDays(new Date(trialEndsAt), new Date())
    : 0;

  return (
    <div className="mb-8">
      {/* Trial Banner */}
      {trialActive && trialEndsAt && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Free Trial Active
                </p>
                <p className="text-sm text-muted-foreground">
                  {daysRemaining > 0 
                    ? `${daysRemaining} days remaining (ends ${format(new Date(trialEndsAt), 'MMM d, yyyy')})`
                    : 'Trial ending today'
                  }
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              <Clock className="w-3 h-3 mr-1" />
              {daysRemaining} days left
            </Badge>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getGreeting()}{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Select a module to get started or manage your subscriptions.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/settings/business-modules" className="gap-2">
            <Settings className="w-4 h-4" />
            Manage Modules
          </Link>
        </Button>
      </div>
    </div>
  );
}
