
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { WorkOrder } from "@/types/workOrder";
import { InventoryItem } from "@/types/inventory";

export interface InvoiceTemplateActionsProps {
  invoice: Invoice;
  taxRate: number;
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
  onSaveTemplate: (template: Partial<InvoiceTemplate>) => Promise<void>;
}

export interface WorkOrderSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
  workOrders: WorkOrder[];
}

export interface InventoryItemSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: InventoryItem) => void;
  inventoryItems: InventoryItem[];
  templates?: InvoiceTemplate[];
  onApplyTemplate?: (template: InvoiceTemplate) => void;
}

export interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItemQuantity: (id: string, quantity: number) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
}
