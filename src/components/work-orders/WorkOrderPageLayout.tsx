
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkOrderPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  backLink?: string;
  backLinkText?: string;
}

export function WorkOrderPageLayout({
  title,
  description,
  children,
  backLink,
  backLinkText = "Back"
}: WorkOrderPageLayoutProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        {backLink && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground"
              asChild
            >
              <Link to={backLink}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                {backLinkText}
              </Link>
            </Button>
          </div>
        )}
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
}
