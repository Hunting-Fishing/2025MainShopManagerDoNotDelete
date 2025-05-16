
import React, { createContext, useContext, useState } from 'react';

interface ShopContextType {
  shopId: string | null;
  setShopId: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [shopId, setShopId] = useState<string | null>(null);

  return (
    <ShopContext.Provider value={{ shopId, setShopId }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
