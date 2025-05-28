
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ShoppingControls() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Shopping Controls</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Manage affiliate products, categories, and user submissions
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Product Management</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Configure and manage affiliate products and categories.
          </p>
        </div>
      </div>
    </div>
  );
}
