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
  Building
} from 'lucide-react';

export const navigation = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Customers',
    items: [
      {
        title: 'Customers',
        href: '/customers',
        icon: Users,
      },
    ],
  },
  {
    title: 'Inventory',
    items: [
      {
        title: 'Inventory',
        href: '/inventory',
        icon: Package,
      },
    ],
  },
  {
    title: 'Scheduling',
    items: [
      {
        title: 'Calendar',
        href: '/calendar',
        icon: Calendar,
      },
      {
        title: 'Service Reminders',
        href: '/service-reminders',
        icon: Bell,
      },
    ],
  },
  {
    title: 'Communications',
    items: [
      {
        title: 'Customer Comms',
        href: '/customer-comms',
        icon: MessageSquare,
      },
      {
        title: 'Call Logger',
        href: '/call-logger',
        icon: Phone,
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        title: 'Quotes',
        href: '/quotes',
        icon: FileText,
      },
      {
        title: 'Work Orders',
        href: '/work-orders',
        icon: Wrench,
      },
      {
        title: 'Invoices',
        href: '/invoices',
        icon: Receipt,
      },
      {
        title: 'Service Board',
        href: '/service-board',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Company',
    items: [
      {
        title: 'Company Profile',
        href: '/company-profile',
        icon: Building,
      },
      {
        title: 'Team',
        href: '/team',
        icon: UserCog,
      },
      {
        title: 'Vehicles',
        href: '/vehicles',
        icon: Truck,
      },
      {
        title: 'Documents',
        href: '/documents',
        icon: FileBarChart,
      },
    ],
  },
  {
    title: 'Services',
    items: [
      {
        title: 'Service Editor',
        href: '/service-editor',
        icon: Cog,
      },
      {
        title: 'Service Library',
        href: '/services',
        icon: Star,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Help',
        href: '/help',
        icon: HelpCircle,
      },
      {
        title: 'Security',
        href: '/security',
        icon: Shield,
      },
    ],
  },
];
