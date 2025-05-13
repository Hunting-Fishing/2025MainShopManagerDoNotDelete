
import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WorkOrderPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backLink?: string;
  backLinkText?: string;
  actions?: React.ReactNode;
}

export const WorkOrderPageLayout: React.FC<WorkOrderPageLayoutProps> = ({
  title,
  description,
  children,
  backLink = "/work-orders",
  backLinkText = "Back to Work Orders",
  actions
}) => {
  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to={backLink} className="hover:text-primary flex items-center gap-1 font-medium text-sm text-blue-600">
                <ChevronLeft className="h-4 w-4" />
                {backLinkText}
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
};
