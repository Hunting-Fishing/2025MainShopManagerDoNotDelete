
import React from "react";

interface WorkOrderFormHeaderProps {
  title: string;
  description: string;
}

export const WorkOrderFormHeader: React.FC<WorkOrderFormHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
};
