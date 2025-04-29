
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  isActive?: boolean;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon: Icon,
  path,
  isActive = false,
}) => {
  return (
    <Link to={path} className="block">
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md border overflow-hidden ${
          isActive 
            ? 'border-blue-500 shadow-md ring-1 ring-blue-400 ring-opacity-40' 
            : 'hover:border-slate-300'
        }`} 
      >
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex items-start">
              <div className={`rounded-full p-2 mr-3 ${
                isActive ? 'text-white bg-blue-600' : 'text-slate-600 bg-slate-100'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
