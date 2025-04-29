
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShoppingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  isActive?: boolean;
  badge?: string;
}

export const ShoppingCard: React.FC<ShoppingCardProps> = ({
  title,
  description,
  icon: Icon,
  path,
  isActive = false,
  badge
}) => {
  return (
    <Link to={path} className="block">
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md border overflow-hidden ${
          isActive 
            ? 'border-purple-500 shadow-md ring-1 ring-purple-400 ring-opacity-40' 
            : 'hover:border-slate-300'
        }`} 
      >
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex items-start">
              <div className={`rounded-full p-2 mr-3 ${
                isActive ? 'text-white bg-purple-600' : 'text-slate-600 bg-slate-100'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900">{title}</h3>
                  {badge && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      {badge}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
