
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShoppingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  badge?: string;
  badgeColor?: 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
}

export const ShoppingCard: React.FC<ShoppingCardProps> = ({
  title,
  description,
  icon: Icon,
  path,
  badge,
  badgeColor = 'default'
}) => {
  // Map colors to Tailwind classes
  const getBadgeClasses = () => {
    const colorMap: Record<string, string> = {
      default: "bg-gray-100 text-gray-800 border-gray-300",
      blue: "bg-blue-100 text-blue-800 border-blue-300",
      green: "bg-green-100 text-green-800 border-green-300", 
      red: "bg-red-100 text-red-800 border-red-300",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
      purple: "bg-purple-100 text-purple-800 border-purple-300",
      orange: "bg-orange-100 text-orange-800 border-orange-300"
    };
    
    return colorMap[badgeColor] || colorMap.default;
  };

  return (
    <Link to={path}>
      <Card className="transition-all duration-300 hover:shadow-lg border-t-4 border-t-blue-500 h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-b from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{title}</h3>
                {badge && (
                  <Badge className={getBadgeClasses()}>
                    {badge}
                  </Badge>
                )}
              </div>
              
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
