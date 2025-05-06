
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function InventoryFieldManager() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Field Settings</CardTitle>
          <CardDescription>
            Configure which fields are required for your inventory items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Customize which fields are required, optional, or hidden when creating and editing inventory items.
          </p>
          <div className="flex flex-col space-y-4 mt-4">
            <FieldSection title="Basic Information" fields={["Name", "SKU", "Part Number", "Category"]} />
            <FieldSection title="Stock Information" fields={["Quantity", "Location", "Reorder Point", "Cost"]} />
            <FieldSection title="Pricing" fields={["Unit Price", "Markup/Margin"]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Display Settings</CardTitle>
          <CardDescription>
            Configure how the inventory table displays data
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <p>Manage which columns are visible in the inventory table and their order.</p>
          <Button asChild>
            <Link to="/settings/inventory?tab=columns">Manage Table Columns</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FieldSection({ title, fields }: { title: string; fields: string[] }) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {fields.map((field) => (
          <div key={field} className="flex items-center justify-between p-2 border rounded">
            <span>{field}</span>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Required</span>
          </div>
        ))}
      </div>
    </div>
  );
}
