
import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Shopping() {
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Shopping | Easy Shop Manager</title>
        <meta name="description" content="Browse and purchase equipment, tools, and supplies for your shop." />
        <meta name="keywords" content="shop equipment, tools, supplies, shop management, purchasing" />
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Shopping</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Browse our selection of featured products for your shop.</p>
            
            <div className="mt-8 text-center text-muted-foreground">
              <p>Shop functionality coming soon!</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">Tools</button>
              <button className="w-full text-left px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">Equipment</button>
              <button className="w-full text-left px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">Supplies</button>
              <button className="w-full text-left px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">Parts</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
