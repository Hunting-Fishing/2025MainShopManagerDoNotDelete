
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {backLink && (
                <Button variant="ghost" asChild className="flex items-center gap-2">
                  <Link to={backLink}>
                    <ArrowLeft className="h-4 w-4" />
                    {backLinkText}
                  </Link>
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}
