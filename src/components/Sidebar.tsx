
import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarNavList } from './layout/sidebar/SidebarNavList';

const Sidebar: React.FC = () => {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-indigo-700 to-purple-800 text-white p-4 overflow-y-auto shadow-lg">
      <div className="flex items-center justify-center mb-8 pt-4">
        <span className="text-2xl font-bold">Shop Manager</span>
      </div>
      
      <nav>
        <SidebarNavList />
      </nav>
    </div>
  );
};

export default Sidebar;
