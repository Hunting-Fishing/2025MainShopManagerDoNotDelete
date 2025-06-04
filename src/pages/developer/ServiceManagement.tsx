
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wrench } from "lucide-react";
import ServiceHierarchyBrowser from '@/components/developer/service-management/ServiceHierarchyBrowser';
import { useServiceCategories } from '@/hooks/useServiceCategories';

export default function ServiceManagement() {
  const { categories, loading, error, refetch } = useServiceCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Console
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Service Management</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Configure available services, subcategories, and jobs with pricing using live database data
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Error loading service data: {error}</p>
          <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      <ServiceHierarchyBrowser 
        categories={categories}
        isLoading={loading}
        onRefresh={refetch}
      />
    </div>
  );
}
