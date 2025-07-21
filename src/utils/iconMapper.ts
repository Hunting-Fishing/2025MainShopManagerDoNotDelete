
import { LucideIcon } from 'lucide-react';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Receipt, 
  FileText,
  Package, 
  Calendar,
  MessageSquare,
  Settings,
  BarChart3,
  ClipboardList,
  Phone,
  Star,
  Bell,
  Cog,
  Shield,
  HelpCircle,
  ShoppingCart,
  Building2,
  Truck,
  UserCog,
  FileBarChart,
  Building,
  MapPin,
  Archive,
  ShoppingBag,
  Boxes,
  CreditCard,
  DollarSign
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // Dashboard
  'LayoutDashboard': LayoutDashboard,
  'layout-dashboard': LayoutDashboard,
  'dashboard': LayoutDashboard,
  
  // Customers
  'Users': Users,
  'users': Users,
  'customer': Users,
  'customers': Users,
  
  // Work Orders
  'Wrench': Wrench,
  'wrench': Wrench,
  'work-orders': Wrench,
  'workorders': Wrench,
  
  // Inventory
  'Package': Package,
  'package': Package,
  'inventory': Package,
  'Boxes': Boxes,
  'boxes': Boxes,
  'inventory-manager': Boxes,
  
  // Calendar
  'Calendar': Calendar,
  'calendar': Calendar,
  'schedule': Calendar,
  
  // Communications
  'MessageSquare': MessageSquare,
  'message-square': MessageSquare,
  'communications': MessageSquare,
  'customer-comms': MessageSquare,
  'Phone': Phone,
  'phone': Phone,
  'call-logger': Phone,
  'Bell': Bell,
  'bell': Bell,
  'service-reminders': Bell,
  
  // Operations
  'FileText': FileText,
  'file-text': FileText,
  'quotes': FileText,
  'Receipt': Receipt,
  'receipt': Receipt,
  'invoices': Receipt,
  'ClipboardList': ClipboardList,
  'clipboard-list': ClipboardList,
  'service-board': ClipboardList,
  'ShoppingCart': ShoppingCart,
  'shopping-cart': ShoppingCart,
  'orders': ShoppingCart,
  'CreditCard': CreditCard,
  'credit-card': CreditCard,
  'payments': CreditCard,
  'ShoppingBag': ShoppingBag,
  'shopping-bag': ShoppingBag,
  'DollarSign': DollarSign,
  'dollar-sign': DollarSign,
  
  // Company
  'Building': Building,
  'building': Building,
  'company-profile': Building,
  'UserCog': UserCog,
  'user-cog': UserCog,
  'team': UserCog,
  'Truck': Truck,
  'truck': Truck,
  'vehicles': Truck,
  'FileBarChart': FileBarChart,
  'file-bar-chart': FileBarChart,
  'documents': FileBarChart,
  'Building2': Building2,
  'building2': Building2,
  'suppliers': Building2,
  'MapPin': MapPin,
  'map-pin': MapPin,
  'locations': MapPin,
  
  // Services
  'Cog': Cog,
  'cog': Cog,
  'service-editor': Cog,
  'Star': Star,
  'star': Star,
  'services': Star,
  'Archive': Archive,
  'archive': Archive,
  'repair-plans': Archive,
  
  // Settings & Support
  'Settings': Settings,
  'settings': Settings,
  'HelpCircle': HelpCircle,
  'help-circle': HelpCircle,
  'help': HelpCircle,
  'Shield': Shield,
  'shield': Shield,
  'security': Shield,
  
  // Analytics
  'BarChart3': BarChart3,
  'bar-chart-3': BarChart3,
  'analytics': BarChart3,
  'reports': BarChart3
};

export function getIconComponent(iconName: string | LucideIcon): LucideIcon {
  // If it's already a component, return it
  if (typeof iconName === 'function') {
    return iconName;
  }
  
  // If it's a string, look it up in the map
  if (typeof iconName === 'string') {
    const icon = iconMap[iconName] || iconMap[iconName.toLowerCase()];
    return icon || Settings; // Default fallback icon
  }
  
  // Fallback
  return Settings;
}

export default iconMap;
