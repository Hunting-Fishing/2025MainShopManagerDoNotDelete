
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerEntity } from "@/domain/customer/entities/Customer";
import { Eye, Edit, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

interface CustomerTableProps {
  customers: CustomerEntity[];
  isLoading: boolean;
}

export function CustomerTable({ customers, isLoading }: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!customers.length) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-500 text-lg">No customers found</p>
        <p className="text-slate-400 text-sm mt-2">
          Try adjusting your search criteria or add a new customer.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-900">Customer</TableHead>
            <TableHead className="font-semibold text-slate-900">Contact</TableHead>
            <TableHead className="font-semibold text-slate-900">Location</TableHead>
            <TableHead className="font-semibold text-slate-900">Vehicles</TableHead>
            <TableHead className="font-semibold text-slate-900">Type</TableHead>
            <TableHead className="font-semibold text-slate-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-slate-50">
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
                  <div className="text-sm text-slate-900">{customer.email}</div>
                  <div className="text-sm text-slate-500">{customer.phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-slate-900">
                  {customer.city && customer.state 
                    ? `${customer.city}, ${customer.state}`
                    : customer.address || 'No address'
                  }
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={customer.hasVehicles() ? "default" : "secondary"}>
                  {customer.vehicleCount} {customer.vehicleCount === 1 ? 'vehicle' : 'vehicles'}
                </Badge>
              </TableCell>
              <TableCell>
                {customer.isFleetCustomer() ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Fleet
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                    Individual
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/customers/${customer.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/customers/${customer.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4" />
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
