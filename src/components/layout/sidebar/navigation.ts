
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
  ClipboardList,
  Phone,
  Star,
  Bell,
  Cog,
  HelpCircle,
  ShoppingCart,
  Truck,
  UserCog,
  FileBarChart,
  Building,
  Archive,
  ShoppingBag,
  Boxes,
  Store,
  Heart,
  Hammer,
  AlertCircle,
  Shield,
  User,
  FileBarChart2,
  FormInput,
  MessageCircle,
  Mail,
  Send,
  Brain,
  Code,
  MessagesSquare,
  BarChart3,
  Gauge,
  TrendingDown,
  Smartphone,
  GraduationCap
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  /** The permission module to check for view access */
  permissionModule?: string;
}

export interface NavigationSection {
  title: string;
  icon?: LucideIcon;
  items: NavigationItem[];
}

export const navigation: NavigationSection[] = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Main dashboard overview',
        // No permission module - dashboard is accessible to all authenticated users
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
        description: 'Manage customer database',
        permissionModule: 'customers',
      },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      { title: "Inventory Overview", href: "/inventory", icon: Package, description: "Main inventory overview", permissionModule: 'inventory' },
      { title: "Service Packages", href: "/service-packages", icon: Boxes, description: "Service templates with parts", permissionModule: 'service_packages' },
      { title: "Asset Work Orders", href: "/work-orders", icon: ClipboardList, description: "Manage maintenance work orders", permissionModule: 'work_orders' },
      { title: "Asset Usage", href: "/asset-usage", icon: Gauge, description: "Track vehicle and equipment usage", permissionModule: 'equipment_tracking' },
      { title: "Consumption Tracking", href: "/consumption-tracking", icon: TrendingDown, description: "Log parts consumption", permissionModule: 'inventory' },
      { title: "Mobile Scanner", href: "/mobile-inventory", icon: Smartphone, description: "Quick stock adjustments", permissionModule: 'inventory' },
      { title: "Inventory Analytics", href: "/inventory-analytics", icon: BarChart3, description: "Forecasting & analytics", permissionModule: 'analytics' },
      { title: "Inventory Manager", href: "/inventory-manager", icon: Settings, description: "Advanced inventory settings", permissionModule: 'inventory' },
      { title: "Maintenance Planning", href: "/maintenance-planning", icon: Wrench, description: "Predictive maintenance & scheduling", permissionModule: 'maintenance_requests' },
    ],
  },
  {
    title: 'Scheduling',
    items: [
      {
        title: 'Service Calendar',
        href: '/calendar',
        icon: Calendar,
        description: 'Work orders, maintenance & repairs scheduling',
        permissionModule: 'calendar',
      },
      {
        title: 'Staff Scheduling',
        href: '/scheduling',
        icon: UserCog,
        description: 'Employee schedules & asset assignments',
        permissionModule: 'team',
      },
      {
        title: 'Service Reminders',
        href: '/service-reminders',
        icon: Bell,
        description: 'Manage service reminders',
        permissionModule: 'service_reminders',
      },
    ],
  },
  {
    title: 'Communications',
    items: [
      {
        title: 'Team Chat',
        href: '/chat',
        icon: MessageCircle,
        description: 'Internal team messaging',
        permissionModule: 'team_chat',
      },
      {
        title: 'Customer Comms',
        href: '/customer-comms',
        icon: MessageSquare,
        description: 'SMS templates and communications',
        permissionModule: 'customer_communications',
      },
      {
        title: 'Call Logger',
        href: '/call-logger',
        icon: Phone,
        description: 'Log customer calls',
        permissionModule: 'call_logger',
      },
    ],
  },
  {
    title: 'Marketing',
    items: [
      {
        title: 'Email Campaigns',
        href: '/email-campaigns',
        icon: Mail,
        description: 'Manage email campaigns',
        permissionModule: 'email_campaigns',
      },
      {
        title: 'Email Sequences',
        href: '/email-sequences',
        icon: Send,
        description: 'Automated email workflows',
        permissionModule: 'marketing',
      },
      {
        title: 'Email Templates',
        href: '/email-templates',
        icon: FileText,
        description: 'Email template library',
        permissionModule: 'marketing',
      },
      {
        title: 'SMS Management',
        href: '/sms-management',
        icon: MessagesSquare,
        description: 'SMS campaigns and bulk messaging',
        permissionModule: 'sms_management',
      },
      {
        title: 'SMS Templates',
        href: '/sms-templates',
        icon: MessageSquare,
        description: 'SMS template library',
        permissionModule: 'marketing',
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
        description: 'Manage quotes and estimates',
        permissionModule: 'quotes',
      },
      {
        title: 'Work Orders',
        href: '/work-orders',
        icon: Wrench,
        description: 'Manage work orders',
        permissionModule: 'work_orders',
      },
      {
        title: 'Invoices',
        href: '/invoices',
        icon: Receipt,
        description: 'Manage invoices',
        permissionModule: 'invoices',
      },
      {
        title: 'Service Board',
        href: '/service-board',
        icon: ClipboardList,
        description: 'Service management board',
        permissionModule: 'work_orders',
      },
      {
        title: 'Payments',
        href: '/payments',
        icon: ShoppingBag,
        description: 'Payment processing',
        permissionModule: 'payments',
      },
    ],
  },
  {
    title: 'Equipment & Tools',
    items: [
      {
        title: 'Equipment Management',
        href: '/equipment-management',
        icon: Hammer,
        description: 'Manage equipment, tools, and maintenance',
        permissionModule: 'equipment_tracking',
      },
      {
        title: 'Maintenance Requests',
        href: '/maintenance-requests',
        icon: AlertCircle,
        description: 'Track maintenance requests',
        permissionModule: 'maintenance_requests',
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
        description: 'Company information',
        permissionModule: 'settings',
      },
      {
        title: 'Team',
        href: '/team',
        icon: UserCog,
        description: 'Team management',
        permissionModule: 'team',
      },
      {
        title: 'Training Overview',
        href: '/training-overview',
        icon: GraduationCap,
        description: 'Monitor team certifications and training',
        permissionModule: 'team',
      },
      {
        title: 'Vehicles',
        href: '/vehicles',
        icon: Truck,
        description: 'Fleet management',
        permissionModule: 'fleet_management',
      },
      {
        title: 'Documents',
        href: '/documents',
        icon: FileBarChart,
        description: 'Document management',
        permissionModule: 'documents',
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
        description: 'Edit service offerings',
        permissionModule: 'service_catalog',
      },
      {
        title: 'Service Library',
        href: '/services',
        icon: Star,
        description: 'Browse service catalog',
        permissionModule: 'service_catalog',
      },
      {
        title: 'Repair Plans',
        href: '/repair-plans',
        icon: Archive,
        description: 'Manage repair plans',
        permissionModule: 'service_packages',
      },
    ],
  },
  {
    title: 'Store',
    items: [
      {
        title: 'Shopping',
        href: '/shopping',
        icon: Store,
        description: 'Browse products and tools',
        permissionModule: 'shopping',
      },
      {
        title: 'Shopping Cart',
        href: '/shopping/cart',
        icon: ShoppingCart,
        description: 'View cart and checkout',
        permissionModule: 'shopping',
      },
      {
        title: 'Wishlist',
        href: '/wishlist',
        icon: Heart,
        description: 'Your saved items',
        permissionModule: 'shopping',
      },
      {
        title: 'Orders',
        href: '/orders',
        icon: ShoppingBag,
        description: 'Order history and tracking',
        permissionModule: 'orders',
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        title: 'AI Hub',
        href: '/ai-hub',
        icon: Brain,
        description: 'AI-powered automation & insights',
        permissionModule: 'analytics',
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: FileBarChart2,
        description: 'Generate and view reports',
        permissionModule: 'reports',
      },
      {
        title: 'Forms',
        href: '/forms',
        icon: FormInput,
        description: 'Create and manage forms',
        permissionModule: 'reports',
      },
      {
        title: 'Feedback',
        href: '/feedback',
        icon: Star,
        description: 'Customer feedback & reviews',
        permissionModule: 'customers',
      },
      {
        title: 'Developer',
        href: '/developer',
        icon: Code,
        description: 'Developer tools & API',
        permissionModule: 'developer_tools',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Profile',
        href: '/profile',
        icon: User,
        description: 'Your profile settings',
        // No permission module - profile is accessible to all authenticated users
      },
      {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
        description: 'Manage notifications',
        // No permission module - notifications is accessible to all authenticated users
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'System configuration',
        permissionModule: 'settings',
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
        description: 'Help and documentation',
        // No permission module - help is accessible to all authenticated users
      },
      {
        title: 'Security',
        href: '/security',
        icon: Shield,
        description: 'Security settings',
        permissionModule: 'security',
      },
    ],
  },
];
