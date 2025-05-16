
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Shop {
  id: string;
  name: string;
}

interface ShopContextProps {
  currentShop: Shop | null;
  setCurrentShop: (shop: Shop | null) => void;
}

const ShopContext = createContext<ShopContextProps>({
  currentShop: null,
  setCurrentShop: () => {},
});

export const useShop = () => useContext(ShopContext);

interface ShopProviderProps {
  children: ReactNode;
}

export const ShopProvider: React.FC<ShopProviderProps> = ({ children }) => {
  const [currentShop, setCurrentShop] = useState<Shop | null>({
    id: '1',
    name: 'Demo Shop'
  });

  return (
    <ShopContext.Provider value={{ currentShop, setCurrentShop }}>
      {children}
    </ShopContext.Provider>
  );
};
