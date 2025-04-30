
import React from 'react';

interface ShoppingProductsProps {
  category: 'all' | 'consumables' | 'tools' | 'user-suggestions';
  searchQuery: string;
}

export function ShoppingProducts({ category, searchQuery }: ShoppingProductsProps) {
  return (
    <div className="p-4 text-center text-muted-foreground">
      <p>No products found matching your filters</p>
    </div>
  );
}
