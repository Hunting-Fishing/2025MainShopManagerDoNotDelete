
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Invoice, StaffMember, InvoiceItem } from "@/types/invoice";

// Default empty invoice
const DEFAULT_INVOICE: Invoice = {
  id: uuidv4(),
  number: `INV-${Date.now().toString().slice(-6)}`,
  customer: "",
  customer_address: "",
  customer_email: "",
  status: "draft",
  date: new Date().toISOString().split('T')[0],
  issue_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  description: "",
  payment_method: "",
  subtotal: 0,
  tax: 0,
  tax_rate: 0.0,
  total: 0,
  notes: "",
  work_order_id: "",
  created_by: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  items: [],
  assignedStaff: []
};

export function useInvoice(initialWorkOrderId?: string) {
  const [invoice, setInvoice] = useState<Invoice>({
    ...DEFAULT_INVOICE,
    work_order_id: initialWorkOrderId || ""
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const calculateSubtotal = (items: InvoiceItem[]): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateTax = (subtotal: number, taxRate: number): number => {
    return subtotal * taxRate;
  };
  
  const calculateTotal = (subtotal: number, tax: number): number => {
    return subtotal + tax;
  };
  
  const updateInvoiceCalculations = (invoiceToUpdate: Invoice): Invoice => {
    const items = invoiceToUpdate.items || [];
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal, invoiceToUpdate.tax_rate);
    const total = calculateTotal(subtotal, tax);
    
    return {
      ...invoiceToUpdate,
      subtotal,
      tax,
      total
    };
  };
  
  const addItem = (item: InvoiceItem): void => {
    const newItem = {
      ...item,
      id: item.id || uuidv4()
    };
    
    setInvoice(prevInvoice => {
      const updatedInvoice = {
        ...prevInvoice,
        items: [...(prevInvoice.items || []), newItem]
      };
      
      return updateInvoiceCalculations(updatedInvoice);
    });
  };
  
  const removeItem = (itemId: string): void => {
    setInvoice(prevInvoice => {
      const updatedInvoice = {
        ...prevInvoice,
        items: (prevInvoice.items || []).filter(item => item.id !== itemId)
      };
      
      return updateInvoiceCalculations(updatedInvoice);
    });
  };
  
  const updateItem = (itemId: string, updates: Partial<InvoiceItem>): void => {
    setInvoice(prevInvoice => {
      const updatedItems = (prevInvoice.items || []).map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      
      const updatedInvoice = {
        ...prevInvoice,
        items: updatedItems
      };
      
      return updateInvoiceCalculations(updatedInvoice);
    });
  };
  
  const addStaffMember = (staff: StaffMember): void => {
    setInvoice(prevInvoice => {
      const staffExists = prevInvoice.assignedStaff?.some(s => s.id === staff.id);
      if (staffExists) return prevInvoice;
      
      return {
        ...prevInvoice,
        assignedStaff: [...(prevInvoice.assignedStaff || []), staff]
      };
    });
  };
  
  const removeStaffMember = (staffId: string): void => {
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      assignedStaff: (prevInvoice.assignedStaff || []).filter(staff => staff.id !== staffId)
    }));
  };
  
  const setTaxRate = (rate: number): void => {
    setInvoice(prevInvoice => {
      const updatedInvoice = {
        ...prevInvoice,
        tax_rate: rate
      };
      
      return updateInvoiceCalculations(updatedInvoice);
    });
  };
  
  const saveInvoice = async (): Promise<Invoice> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, save to database
      const savedInvoice = { ...invoice, updated_at: new Date().toISOString() };
      console.log("Saving invoice:", savedInvoice);
      
      return savedInvoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save invoice";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    invoice,
    setInvoice,
    loading,
    error,
    addItem,
    removeItem,
    updateItem,
    addStaffMember,
    removeStaffMember,
    setTaxRate,
    saveInvoice,
    calculations: {
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      taxRate: invoice.tax_rate
    }
  };
}
