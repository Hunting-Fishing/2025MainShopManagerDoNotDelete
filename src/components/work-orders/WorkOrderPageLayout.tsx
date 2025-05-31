
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkOrderPageLayoutProps {
  title: string;
  description?: string;
  backLink?: string;
  backLinkText?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function WorkOrderPageLayout({
  title,
  description,
  backLink,
  backLinkText = 'Back',
  actions,
  children
}: WorkOrderPageLayoutProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backLink && (
            <Button variant="ghost" asChild className="p-2">
              <Link to={backLink}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backLinkText}
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
}
