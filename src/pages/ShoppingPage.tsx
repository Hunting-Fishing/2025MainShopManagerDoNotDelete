
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function ShoppingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Shop | Easy Shop Manager</title>
        <meta name="description" content="Browse and purchase tools and equipment" />
      </Helmet>
      
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Shopping</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop</h1>
      </div>
      
      <Card className="bg-white shadow-md rounded-xl border border-gray-100">
        <CardContent className="p-6">
          <p>Shopping page content will be displayed here.</p>
          <p className="mt-4 text-sm text-gray-500">This page is under development. Check back soon for our complete catalog of tools and equipment.</p>
        </CardContent>
      </Card>
    </div>
  );
}
