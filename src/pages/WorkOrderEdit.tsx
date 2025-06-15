import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const WorkOrderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">No work order ID provided.</div>
        </CardContent>
      </Card>
    );
  }

  // Later: Replace this stub with the editable form view
  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="text-xl font-bold mb-2">Edit Work Order</h1>
        <div>Work Order ID: <span className="text-blue-600">{id}</span></div>
        <div className="text-gray-500 mt-2">Work order editing form goes here.</div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderEdit;
