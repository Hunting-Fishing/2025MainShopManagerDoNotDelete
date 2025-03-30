import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Download, Save, Database, FileDown, RefreshCw, Calendar, Users, FileText, Settings, Clock } from "lucide-react";
import { exportToCSV, exportToExcel, exportMultiSheetExcel, exportToPDF } from "@/utils/export";
import { generateReportPdf, savePdf } from "@/utils/pdf";
import { invoices } from "@/data/invoiceData";
import { workOrders } from "@/data/workOrdersData";
import { customers } from "@/data/customersData";
import { inventoryItems } from "@/data/mockInventoryData";
import { getCustomerFullName } from "@/types/customer";

const DataExportTab = () => {
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});
  
  const startExport = (key: string) => {
    setIsExporting(prev => ({ ...prev, [key]: true }));
  };
  
  const finishExport = (key: string) => {
    setIsExporting(prev => ({ ...prev, [key]: false }));
  };
  
  const handleExportData = (dataType: string, format: "csv" | "excel" | "pdf") => {
    const exportKey = `${dataType}-${format}`;
    startExport(exportKey);
    
    try {
      let data: any[] = [];
      let columns: { header: string; dataKey: string }[] = [];
      
      switch (dataType) {
        case "customers":
          data = customers.map(customer => {
            const customerName = customer.name || getCustomerFullName(customer);
            const dateAdded = customer.dateAdded || customer.created_at.split('T')[0];
            
            return {
              id: customer.id,
              name: customerName,
              company: customer.company || '',
              email: customer.email || '',
              phone: customer.phone || '',
              address: customer.address || '',
              dateAdded: dateAdded,
              lastServiceDate: customer.lastServiceDate || '',
              status: customer.status || 'active'
            };
          });
          
          columns = [
            { header: "ID", dataKey: "id" },
            { header: "Name", dataKey: "name" },
            { header: "Company", dataKey: "company" },
            { header: "Email", dataKey: "email" },
            { header: "Phone", dataKey: "phone" },
            { header: "Address", dataKey: "address" },
            { header: "Date Added", dataKey: "dateAdded" },
            { header: "Last Service", dataKey: "lastServiceDate" },
            { header: "Status", dataKey: "status" }
          ];
          break;
          
        case "workOrders":
          data = workOrders.map(order => ({
            id: order.id,
            customer: order.customer,
            description: order.description || '',
            status: order.status,
            priority: order.priority,
            date: order.date,
            dueDate: order.dueDate,
            technician: order.technician,
            location: order.location || '',
            billableTime: order.totalBillableTime || 0
          }));
          
          columns = [
            { header: "ID", dataKey: "id" },
            { header: "Customer", dataKey: "customer" },
            { header: "Description", dataKey: "description" },
            { header: "Status", dataKey: "status" },
            { header: "Priority", dataKey: "priority" },
            { header: "Date", dataKey: "date" },
            { header: "Due Date", dataKey: "dueDate" },
            { header: "Technician", dataKey: "technician" },
            { header: "Location", dataKey: "location" },
            { header: "Billable Time", dataKey: "billableTime" }
          ];
          break;
          
        case "invoices":
          data = invoices.map(invoice => ({
            id: invoice.id,
            customer: invoice.customer,
            description: invoice.description || '',
            total: invoice.total,
            status: invoice.status,
            date: invoice.date,
            dueDate: invoice.dueDate,
            workOrderId: invoice.workOrderId || '',
            paymentMethod: invoice.paymentMethod || ''
          }));
          
          columns = [
            { header: "ID", dataKey: "id" },
            { header: "Customer", dataKey: "customer" },
            { header: "Description", dataKey: "description" },
            { header: "Total", dataKey: "total" },
            { header: "Status", dataKey: "status" },
            { header: "Date", dataKey: "date" },
            { header: "Due Date", dataKey: "dueDate" },
            { header: "Work Order", dataKey: "workOrderId" },
            { header: "Payment Method", dataKey: "paymentMethod" }
          ];
          break;
          
        case "inventory":
          data = inventoryItems.map(item => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            category: item.category,
            supplier: item.supplier,
            quantity: item.quantity,
            reorderPoint: item.reorderPoint,
            unitPrice: item.unitPrice,
            location: item.location,
            status: item.status
          }));
          
          columns = [
            { header: "ID", dataKey: "id" },
            { header: "Name", dataKey: "name" },
            { header: "SKU", dataKey: "sku" },
            { header: "Category", dataKey: "category" },
            { header: "Supplier", dataKey: "supplier" },
            { header: "Quantity", dataKey: "quantity" },
            { header: "Reorder Point", dataKey: "reorderPoint" },
            { header: "Unit Price", dataKey: "unitPrice" },
            { header: "Location", dataKey: "location" },
            { header: "Status", dataKey: "status" }
          ];
          break;
          
        case "completeBackup":
          const backupData = {
            "Customers": customers.map(customer => {
              const customerName = customer.name || getCustomerFullName(customer);
              const dateAdded = customer.dateAdded || customer.created_at.split('T')[0];
              
              return {
                id: customer.id,
                name: customerName,
                company: customer.company || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
                dateAdded: dateAdded,
                lastServiceDate: customer.lastServiceDate || '',
                status: customer.status || 'active'
              };
            }),
            "Work Orders": workOrders.map(order => ({
              id: order.id,
              customer: order.customer,
              description: order.description || '',
              status: order.status,
              priority: order.priority,
              date: order.date,
              dueDate: order.dueDate,
              technician: order.technician,
              location: order.location || '',
              billableTime: order.totalBillableTime || 0
            })),
            "Invoices": invoices.map(invoice => ({
              id: invoice.id,
              customer: invoice.customer,
              description: invoice.description || '',
              total: invoice.total,
              status: invoice.status,
              date: invoice.date,
              dueDate: invoice.dueDate,
              workOrderId: invoice.workOrderId || '',
              paymentMethod: invoice.paymentMethod || ''
            })),
            "Inventory": inventoryItems.map(item => ({
              id: item.id,
              name: item.name,
              sku: item.sku,
              category: item.category,
              supplier: item.supplier,
              quantity: item.quantity,
              reorderPoint: item.reorderPoint,
              unitPrice: item.unitPrice,
              location: item.location,
              status: item.status
            }))
          };
          
          exportMultiSheetExcel(backupData, `Shop_Data_Backup_${new Date().toISOString().split('T')[0]}`);
          finishExport(exportKey);
          
          toast({
            title: "Backup complete",
            description: "Full shop data backed up successfully",
          });
          return;
      }
      
      switch (format) {
        case "csv":
          exportToCSV(data, `${dataType}_${new Date().toISOString().split('T')[0]}`);
          break;
        case "excel":
          exportToExcel(data, `${dataType}_${new Date().toISOString().split('T')[0]}`);
          break;
        case "pdf":
          const doc = generateReportPdf(
            `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data Export`, 
            data, 
            columns
          );
          savePdf(doc, `${dataType}_${new Date().toISOString().split('T')[0]}`);
          break;
      }
      
      toast({
        title: "Export successful",
        description: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error(`Error exporting ${dataType}:`, error);
      toast({
        title: "Export failed",
        description: `There was an error exporting ${dataType} data`,
        variant: "destructive"
      });
    } finally {
      finishExport(exportKey);
    }
  };
  
  return (
    <div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Data Export & Backup</h2>
        <p className="text-muted-foreground">
          Export critical business data or create a complete backup
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Exports</TabsTrigger>
          <TabsTrigger value="complete">Complete Backup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Customers
                </CardTitle>
                <CardDescription>
                  Export customer data including contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Includes customer names, contact information, and service history dates.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["customers-csv"]}
                  onClick={() => handleExportData("customers", "csv")}
                >
                  {isExporting["customers-csv"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      CSV
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["customers-excel"]}
                  onClick={() => handleExportData("customers", "excel")}
                >
                  {isExporting["customers-excel"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Excel
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["customers-pdf"]}
                  onClick={() => handleExportData("customers", "pdf")}
                >
                  {isExporting["customers-pdf"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Work Orders
                </CardTitle>
                <CardDescription>
                  Export work order records and service details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Includes work order details, customer information, status, and scheduling data.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["workOrders-csv"]}
                  onClick={() => handleExportData("workOrders", "csv")}
                >
                  {isExporting["workOrders-csv"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      CSV
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["workOrders-excel"]}
                  onClick={() => handleExportData("workOrders", "excel")}
                >
                  {isExporting["workOrders-excel"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Excel
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["workOrders-pdf"]}
                  onClick={() => handleExportData("workOrders", "pdf")}
                >
                  {isExporting["workOrders-pdf"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Invoices
                </CardTitle>
                <CardDescription>
                  Export invoice data including payment information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Includes invoice details, payment status, and related work order information.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["invoices-csv"]}
                  onClick={() => handleExportData("invoices", "csv")}
                >
                  {isExporting["invoices-csv"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      CSV
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["invoices-excel"]}
                  onClick={() => handleExportData("invoices", "excel")}
                >
                  {isExporting["invoices-excel"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Excel
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["invoices-pdf"]}
                  onClick={() => handleExportData("invoices", "pdf")}
                >
                  {isExporting["invoices-pdf"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Inventory
                </CardTitle>
                <CardDescription>
                  Export inventory items and stock levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Includes item details, quantities, pricing, and supplier information.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["inventory-csv"]}
                  onClick={() => handleExportData("inventory", "csv")}
                >
                  {isExporting["inventory-csv"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      CSV
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["inventory-excel"]}
                  onClick={() => handleExportData("inventory", "excel")}
                >
                  {isExporting["inventory-excel"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Excel
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isExporting["inventory-pdf"]}
                  onClick={() => handleExportData("inventory", "pdf")}
                >
                  {isExporting["inventory-pdf"] ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="complete" className="space-y-4 pt-4">
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Complete Shop Backup
              </CardTitle>
              <CardDescription>
                Generate a complete backup of all shop data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Backup Information</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          This will create a complete backup of all shop data including customers, work orders, 
                          invoices, and inventory. The backup will be exported as a multi-sheet Excel file.
                        </p>
                        <p className="mt-2">
                          Depending on the amount of data, this process may take some time to complete.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>What's included in full backup:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    <li>Customer records and contact information</li>
                    <li>Work order history and service details</li>
                    <li>Complete invoice and payment records</li>
                    <li>Current inventory stock levels and pricing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full"
                disabled={isExporting["completeBackup-excel"]}
                onClick={() => handleExportData("completeBackup", "excel")}
              >
                {isExporting["completeBackup-excel"] ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Backup...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Generate Complete Backup
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Backup Schedule
              </CardTitle>
              <CardDescription>
                Configure automatic backup frequency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Weekly Backup</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup all shop data every Sunday at midnight
                    </p>
                  </div>
                  <Button variant="outline" disabled>Coming Soon</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Monthly Backup</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup all shop data on the 1st of each month
                    </p>
                  </div>
                  <Button variant="outline" disabled>Coming Soon</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataExportTab;
