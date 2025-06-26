
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Phone, Mail } from "lucide-react";
import { CustomerEntity } from "@/domain/customer/entities/Customer";
import { Link } from "react-router-dom";

interface CustomerTableProps {
  customers: CustomerEntity[];
  isLoading: boolean;
}

export function CustomerTable({ customers, isLoading }: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!customers.length) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-2">No customers found</div>
        <div className="text-slate-500">Try adjusting your search or filters</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Customer</TableHead>
            <TableHead className="font-semibold text-slate-700">Contact</TableHead>
            <TableHead className="font-semibold text-slate-700">Location</TableHead>
            <TableHead className="font-semibold text-slate-700">Vehicles</TableHead>
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Added</TableHead>
            <TableHead className="font-semibold text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-slate-50 transition-colors">
              <TableCell>
                <div>
                  <div className="font-medium text-slate-900">{customer.fullName}</div>
                  {customer.company && (
                    <div className="text-sm text-slate-500">{customer.company}</div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-3 w-3 mr-1" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-3 w-3 mr-1" />
                    {customer.phone}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-slate-600">
                  {customer.city && customer.state ? (
                    <>{customer.city}, {customer.state}</>
                  ) : (
                    customer.address?.substring(0, 30) || 'No address'
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={customer.hasVehicles() ? "default" : "secondary"}
                    className={customer.hasVehicles() ? "bg-emerald-100 text-emerald-800" : ""}
                  >
                    {customer.vehicleCount} {customer.vehicleCount === 1 ? 'vehicle' : 'vehicles'}
                  </Badge>
                </div>
              </TableCell>
              
              <TableCell>
                {customer.isFleetCustomer() ? (
                  <Badge className="bg-orange-100 text-orange-800">Fleet</Badge>
                ) : (
                  <Badge variant="secondary">Individual</Badge>
                )}
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-slate-600">
                  {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <Link to={`/customers/${customer.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <Link to={`/customers/${customer.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
