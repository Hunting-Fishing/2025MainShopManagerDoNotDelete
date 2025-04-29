
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface ShoppingPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  affiliateDisclaimer?: boolean;
}

export const ShoppingPageLayout: React.FC<ShoppingPageLayoutProps> = ({ 
  title, 
  description, 
  children,
  actions,
  affiliateDisclaimer = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/shopping">Shop</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between my-6">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 sm:mb-0" 
            onClick={() => navigate("/shopping")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Shop
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            {actions}
          </div>
        )}
      </div>

      <div className="mt-6">
        {children}
      </div>
      
      {affiliateDisclaimer && (
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
          <p>As an Amazon Associate, we earn from qualifying purchases. This helps support our shop and allows us to continue bringing you quality content.</p>
        </div>
      )}
    </div>
  );
};
