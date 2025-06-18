
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { InventoryPartsTab } from './InventoryPartsTab';
import { NonInventoryPartsTab } from './NonInventoryPartsTab';

interface TabbedPartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function TabbedPartEntryForm({ onPartAdd, onCancel, isLoading }: TabbedPartEntryFormProps) {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory Parts</TabsTrigger>
          <TabsTrigger value="non-inventory">Non-Inventory Parts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <InventoryPartsTab onPartAdd={onPartAdd} />
        </TabsContent>

        <TabsContent value="non-inventory" className="mt-4">
          <NonInventoryPartsTab onPartAdd={onPartAdd} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
