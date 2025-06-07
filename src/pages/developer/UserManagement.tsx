
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

export default function UserManagement() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Manage application users and their permissions
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Coming Soon
        </h2>
        <p className="text-blue-700 dark:text-blue-300">
          This module is under development. It will include features for managing users, roles, and permissions across the application.
        </p>
      </div>
    </div>
  );
}
