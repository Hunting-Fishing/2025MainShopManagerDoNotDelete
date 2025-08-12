
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLink?: {
    label: string;
    to: string;
  };
}

export function EmptyState({ icon, title, description, action, actionLink }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
          <div className="p-3 rounded-full bg-muted mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
        {actionLink ? (
          <Button asChild>
            <Link to={actionLink.to}>{actionLink.label}</Link>
          </Button>
        ) : action ? (
          <Button onClick={action.onClick}>{action.label}</Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
