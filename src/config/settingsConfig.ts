
import { 
  Building2, 
  Palette, 
  Bell, 
  Shield, 
  LayoutDashboard,
  Wrench,
  DollarSign,
  Users,
  Gift,
  Settings,
  Zap,
  Database
} from 'lucide-react';

// Import all tab components
import { CompanyTab } from '@/components/settings/tabs/CompanyTab';
import { BrandingTab } from '@/components/settings/branding/BrandingTab';
import { NotificationsTab } from '@/components/settings/notifications/NotificationsTab';
import { SecurityTab } from '@/components/settings/security/SecurityTab';
import { DashboardSettingsTab } from '@/components/settings/DashboardSettingsTab';
import { WorkOrderManagementTab } from '@/components/settings/WorkOrderManagementTab';
import { LoyaltyTab } from '@/components/settings/tabs/LoyaltyTab';

// Settings configuration with proper components
export const SETTINGS_TABS = [
  {
    id: 'company',
    label: 'Company',
    icon: Building2,
    component: CompanyTab,
    description: 'Business information and contact details'
  },
  {
    id: 'branding',
    label: 'Branding',
    icon: Palette,
    component: BrandingTab,
    description: 'Theme, colors, and visual appearance'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    component: NotificationsTab,
    description: 'Notification preferences and delivery settings'
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    component: SecurityTab,
    description: 'Authentication and security policies'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    component: DashboardSettingsTab,
    description: 'Dashboard layout and widget preferences'
  },
  {
    id: 'work-orders',
    label: 'Work Orders',
    icon: Wrench,
    component: WorkOrderManagementTab,
    description: 'Work order settings and workflows'
  },
  {
    id: 'loyalty',
    label: 'Loyalty Program',
    icon: Gift,
    component: LoyaltyTab,
    description: 'Customer loyalty and rewards program'
  }
];

export const SETTINGS_SECTIONS = [
  {
    id: 'core',
    title: 'Core Settings',
    description: 'Essential business and application settings',
    tabs: [
      SETTINGS_TABS.find(t => t.id === 'company')!,
      SETTINGS_TABS.find(t => t.id === 'branding')!,
      SETTINGS_TABS.find(t => t.id === 'notifications')!,
      SETTINGS_TABS.find(t => t.id === 'security')!
    ]
  },
  {
    id: 'features',
    title: 'Feature Configuration',
    description: 'Configure specific application features',
    tabs: [
      SETTINGS_TABS.find(t => t.id === 'dashboard')!,
      SETTINGS_TABS.find(t => t.id === 'work-orders')!,
      SETTINGS_TABS.find(t => t.id === 'loyalty')!
    ]
  }
];

export const DEFAULT_SETTINGS_TAB = 'company';
