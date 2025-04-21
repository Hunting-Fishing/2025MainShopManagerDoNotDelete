
import React from 'react';
import { Outlet } from 'react-router-dom';
import { CustomerPortalHeader } from './CustomerPortalHeader';
import { CustomerPortalSidebar } from './CustomerPortalSidebar';

export function CustomerPortalLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <CustomerPortalSidebar />
      <div className="flex flex-col">
        <CustomerPortalHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
