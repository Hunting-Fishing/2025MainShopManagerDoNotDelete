
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
}

export function SettingsCard({ title, description, icon: Icon, path }: SettingsCardProps) {
  return (
    <Link to={path} className="block">
      <Card className="transition-all hover:shadow-md hover:border-blue-200 h-full">
        <CardContent className="p-4 flex items-start">
          <div className="bg-blue-50 p-3 rounded-full mr-4">
            <Icon className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
