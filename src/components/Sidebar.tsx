
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Car, FileText, Settings, Users, Calendar, Wrench } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-indigo-700 to-purple-800 text-white p-4 overflow-y-auto shadow-lg">
      <div className="flex items-center justify-center mb-8 pt-4">
        <span className="text-2xl font-bold">Shop Manager</span>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <NavItem to="/dashboard" icon={<Home />} label="Dashboard" />
          <NavItem to="/customers" icon={<Users />} label="Customers" />
          <NavItem to="/work-orders" icon={<Wrench />} label="Work Orders" />
          <NavItem to="/calendar" icon={<Calendar />} label="Calendar" />
          <NavItem to="/invoices" icon={<FileText />} label="Invoices" />
          <NavItem to="/settings" icon={<Settings />} label="Settings" />
        </ul>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <li>
      <Link 
        to={to} 
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
      >
        <span className="text-indigo-200">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
};

export default Sidebar;
