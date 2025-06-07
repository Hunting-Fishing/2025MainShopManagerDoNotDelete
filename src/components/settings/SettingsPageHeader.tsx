
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface SettingsPageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backPath?: string;
}

export const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({
  title,
  description,
  showBackButton = true,
  backPath = '/settings'
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between my-6">
        <div>
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2 sm:mb-0" 
              onClick={() => navigate(backPath)}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Settings
            </Button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
    </>
  );
};
