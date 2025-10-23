
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
  Building2,
  Truck,
  UserCog,
  FileBarChart,
  Building,
  MapPin,
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
  MessagesSquare
} from 'lucide-react';

export const navigation = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Main dashboard overview'
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
        description: 'Manage customer database'
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
        description: 'Main inventory overview'
      },
      {
        title: 'Inventory Manager',
        href: '/inventory/manager',
        icon: Boxes,
        description: 'Advanced inventory management'
      },
      {
        title: 'Orders',
        href: '/inventory/orders',
        icon: ShoppingCart,
        description: 'Manage inventory orders'
      },
      {
        title: 'Locations',
        href: '/inventory/locations',
        icon: MapPin,
        description: 'Manage storage locations'
      },
      {
        title: 'Suppliers',
        href: '/inventory/suppliers',
        icon: Building2,
        description: 'Manage suppliers'
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
        description: 'Schedule appointments'
      },
      {
        title: 'Service Reminders',
        href: '/service-reminders',
        icon: Bell,
        description: 'Manage service reminders'
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
        description: 'Internal team messaging'
      },
      {
        title: 'Customer Comms',
        href: '/customer-comms',
        icon: MessageSquare,
        description: 'SMS templates and communications'
      },
      {
        title: 'Call Logger',
        href: '/call-logger',
        icon: Phone,
        description: 'Log customer calls'
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
        description: 'Manage email campaigns'
      },
      {
        title: 'Email Sequences',
        href: '/email-sequences',
        icon: Send,
        description: 'Automated email workflows'
      },
      {
        title: 'Email Templates',
        href: '/email-templates',
        icon: FileText,
        description: 'Email template library'
      },
      {
        title: 'SMS Management',
        href: '/sms-management',
        icon: MessagesSquare,
        description: 'SMS campaigns and bulk messaging'
      },
      {
        title: 'SMS Templates',
        href: '/sms-templates',
        icon: MessageSquare,
        description: 'SMS template library'
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
        description: 'Manage quotes and estimates'
      },
      {
        title: 'Work Orders',
        href: '/work-orders',
        icon: Wrench,
        description: 'Manage work orders'
      },
      {
        title: 'Invoices',
        href: '/invoices',
        icon: Receipt,
        description: 'Manage invoices'
      },
      {
        title: 'Service Board',
        href: '/service-board',
        icon: ClipboardList,
        description: 'Service management board'
      },
      {
        title: 'Payments',
        href: '/payments',
        icon: ShoppingBag,
        description: 'Payment processing'
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
        description: 'Manage equipment, tools, and maintenance'
      },
      {
        title: 'Maintenance Requests',
        href: '/maintenance-requests',
        icon: AlertCircle,
        description: 'Track maintenance requests'
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
        description: 'Company information'
      },
      {
        title: 'Team',
        href: '/team',
        icon: UserCog,
        description: 'Team management'
      },
      {
        title: 'Vehicles',
        href: '/vehicles',
        icon: Truck,
        description: 'Fleet management'
      },
      {
        title: 'Documents',
        href: '/documents',
        icon: FileBarChart,
        description: 'Document management'
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
        description: 'Edit service offerings'
      },
      {
        title: 'Service Library',
        href: '/services',
        icon: Star,
        description: 'Browse service catalog'
      },
      {
        title: 'Repair Plans',
        href: '/repair-plans',
        icon: Archive,
        description: 'Manage repair plans'
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
        description: 'Browse products and tools'
      },
      {
        title: 'Shopping Cart',
        href: '/shopping/cart',
        icon: ShoppingCart,
        description: 'View cart and checkout'
      },
      {
        title: 'Wishlist',
        href: '/wishlist',
        icon: Heart,
        description: 'Your saved items'
      },
      {
        title: 'Orders',
        href: '/orders',
        icon: ShoppingBag,
        description: 'Order history and tracking'
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
        description: 'AI-powered automation & insights'
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: FileBarChart2,
        description: 'Generate and view reports'
      },
      {
        title: 'Forms',
        href: '/forms',
        icon: FormInput,
        description: 'Create and manage forms'
      },
      {
        title: 'Feedback',
        href: '/feedback',
        icon: Star,
        description: 'Customer feedback & reviews'
      },
      {
        title: 'Developer',
        href: '/developer',
        icon: Code,
        description: 'Developer tools & API'
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
        description: 'Your profile settings'
      },
      {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
        description: 'Manage notifications'
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'System configuration'
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
        description: 'Help and documentation'
      },
      {
        title: 'Security',
        href: '/security',
        icon: Shield,
        description: 'Security settings'
      },
    ],
  },
];
