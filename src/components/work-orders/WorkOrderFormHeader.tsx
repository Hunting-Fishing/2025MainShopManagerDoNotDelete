
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
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
