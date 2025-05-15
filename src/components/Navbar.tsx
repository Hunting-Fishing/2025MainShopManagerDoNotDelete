
import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';

const Navbar: React.FC = () => {
  const { user } = useAuthUser();
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-6">
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">{user?.email}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
