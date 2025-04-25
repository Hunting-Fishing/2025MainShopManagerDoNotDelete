import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InvoiceList() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { invoices, isLoading, error } = useInvoiceData();
  const [creators, setCreators] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    status: "all",
    customer: "",
    dateRange: {
      from: null as Date | null,
      to: null as Date | null,
    },
  });

  // Extract list of invoice creators
  useEffect(() => {
    if (invoices?.length) {
      const creatorsList = Array.from(
        new Set(
          invoices
            .filter((inv) => inv.createdBy)
            .map((inv) => inv.createdBy)
        )
      );
      setCreators(creatorsList);
    }
  }, [invoices]);

  const resetFilters = () => {
    setFilters({
      status: "all",
      customer: "",
      dateRange: {
        from: null,
        to: null,
      },
    });
  };

  const statusFilter = (invoice: Invoice) => {
    if (!filters.status) return true;
    if (filters.status === 'all') return true;
    return invoice.status === filters.status;
  };

  const filteredInvoices = invoices?.filter((invoice) => {
    // Filter by status
    if (!statusFilter(invoice)) {
      return false;
    }

    // Filter by customer name
    if (
      filters.customer &&
      !invoice.customer
        .toLowerCase()
        .includes(filters.customer.toLowerCase())
    ) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange.from || filters.dateRange.to) {
      const invoiceDate = new Date(invoice.date);
      
      if (
        filters.dateRange.from &&
        invoiceDate < filters.dateRange.from
      ) {
        return false;
      }
      
      if (
        filters.dateRange.to &&
        invoiceDate > filters.dateRange.to
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link to="/invoices/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <InvoiceFilters 
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <InvoiceTable invoices={filteredInvoices} isLoading={isLoading} error={error} />
            </TabsContent>
            
            <TabsContent value="draft">
              <InvoiceTable
                invoices={filteredInvoices?.filter((inv) => inv.status === "draft")}
                isLoading={isLoading}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="pending">
              <InvoiceTable
                invoices={filteredInvoices?.filter((inv) => inv.status === "pending")}
                isLoading={isLoading}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="paid">
              <InvoiceTable
                invoices={filteredInvoices?.filter((inv) => inv.status === "paid")}
                isLoading={isLoading}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="overdue">
              <InvoiceTable
                invoices={filteredInvoices?.filter((inv) => inv.status === "overdue")}
                isLoading={isLoading}
                error={error}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
