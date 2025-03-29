
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ChevronLeft } from "lucide-react";
import { Customer } from "@/types/customer";
import { CustomerInteraction } from "@/types/interaction";

interface CustomerSummaryCardProps {
  customer: Customer;
  customerWorkOrders: any[];
  customerInteractions: CustomerInteraction[];
  setActiveTab: (tab: string) => void;
}

export const CustomerSummaryCard: React.FC<CustomerSummaryCardProps> = ({
  customer,
  customerWorkOrders,
  customerInteractions,
  setActiveTab
}) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg">Customer Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-slate-500">Total Work Orders</p>
            <p className="text-2xl font-bold">{customerWorkOrders.length}</p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-slate-500">Last Service</p>
            <p className="text-2xl font-bold">
              {customer.lastServiceDate 
                ? new Date(customer.lastServiceDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-slate-500">Interactions</p>
            <p className="text-2xl font-bold">
              {customerInteractions.length}
            </p>
          </div>
        </div>
        
        {customer.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
            </div>
          </div>
        )}
        
        <RecentInteractions 
          customerInteractions={customerInteractions} 
          setActiveTab={setActiveTab} 
        />
      </CardContent>
    </Card>
  );
};

interface RecentInteractionsProps {
  customerInteractions: CustomerInteraction[];
  setActiveTab: (tab: string) => void;
}

const RecentInteractions: React.FC<RecentInteractionsProps> = ({ 
  customerInteractions, 
  setActiveTab 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-500">Recent Interactions</h3>
        <Button 
          variant="link" 
          size="sm" 
          className="h-auto p-0"
          onClick={() => setActiveTab("interactions")}
        >
          <History className="h-4 w-4 mr-1" /> View All
        </Button>
      </div>
      
      {customerInteractions.length > 0 ? (
        <div className="bg-slate-50 rounded-lg divide-y">
          {customerInteractions.slice(0, 3).map((interaction) => (
            <div key={interaction.id} className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{interaction.description}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(interaction.date).toLocaleDateString()} • {interaction.staffMemberName}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6"
                  onClick={() => setActiveTab("interactions")}
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-slate-50 rounded-lg text-slate-500">
          No interactions recorded yet
        </div>
      )}
    </div>
  );
};
