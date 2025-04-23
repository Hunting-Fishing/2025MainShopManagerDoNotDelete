
import React from "react";
import { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { NewCustomerChatButton } from "@/components/chat/customer/NewCustomerChatButton";
import { MessageSquare, Phone, Mail, MessageCircle, CalendarClock, UserPlus, History } from "lucide-react";

interface CustomerDetailsHeaderProps {
  customer: Customer;
  setAddInteractionOpen: (open: boolean) => void;
}

export const CustomerDetailsHeader: React.FC<CustomerDetailsHeaderProps> = ({
  customer,
  setAddInteractionOpen,
}) => {
  const fullName = `${customer.first_name} ${customer.last_name}`;
  const isCompanyCustomer = !!customer.company;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
          {isCompanyCustomer && (
            <p className="text-slate-500 dark:text-slate-400">{customer.company}</p>
          )}
          
          <div className="mt-2 space-y-1">
            {customer.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-400" />
                <a
                  href={`mailto:${customer.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {customer.email}
                </a>
              </div>
            )}
            
            {customer.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-slate-400" />
                <a
                  href={`tel:${customer.phone}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {customer.phone}
                </a>
              </div>
            )}
            
            {customer.address && (
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {customer.address}
                {customer.city ? `, ${customer.city}` : ""}
                {customer.state ? `, ${customer.state}` : ""}
                {customer.postal_code ? ` ${customer.postal_code}` : ""}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
          <div className="flex flex-wrap gap-2">
            <NewCustomerChatButton customer={customer} />
            
            <Button variant="outline" size="sm" onClick={() => setAddInteractionOpen(true)}>
              <History className="w-4 h-4 mr-2" />
              Record Interaction
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {customer.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${customer.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
            
            {customer.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${customer.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </a>
              </Button>
            )}
            
            {customer.phone && (
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Text
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
