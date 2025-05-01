
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  additionalInfo?: React.ReactNode;
  colorClass?: string; // For customizable color styling
}

export function StatCard({ title, value, icon, additionalInfo, colorClass = "bg-blue-100 text-blue-800" }: StatCardProps) {
  return (
    <Card className="shadow-md bg-white rounded-xl border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className={`p-2 rounded-full ${colorClass}`}>
            {icon}
          </div>
          <ArrowUpRight className="h-5 w-5 text-green-500" />
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        {additionalInfo && (
          <div className="flex items-center mt-2">
            {additionalInfo}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
