
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Building2, Calendar } from "lucide-react";
import { Customer } from "@/types/customer";

interface CustomerInfoCardProps {
  customer: Customer;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ customer }) => {
  return (
    <Card className="md:col-span-1">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="text-sm">{customer.email}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500">Phone</p>
              <p className="text-sm">{customer.phone}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500">Address</p>
              <p className="text-sm">{customer.address}</p>
            </div>
          </div>
          
          {customer.company && (
            <div className="flex items-start">
              <Building2 className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Company</p>
                <p className="text-sm">{customer.company}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500">Customer Since</p>
              <p className="text-sm">{new Date(customer.dateAdded).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
