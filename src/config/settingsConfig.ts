
import { 
  Building2, 
  Users, 
  Bell, 
  Palette, 
  Package, 
  Wrench,
  Hash
} from 'lucide-react';
import { CompanyTab } from '@/components/settings/CompanyTab';
import { TeamTab } from '@/components/settings/TeamTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { BrandingTab } from '@/components/settings/BrandingTab';
import { InventorySettingsTab } from '@/components/settings/InventorySettingsTab';
import { DIYBayRatesTab } from '@/components/settings/DIYBayRatesTab';
import { WorkOrderNumberingTab } from '@/components/settings/WorkOrderNumberingTab';
import { SettingsTabConfig } from '@/types/settingsConfig';

export const SETTINGS_TABS: SettingsTabConfig[] = [
  {
    id: 'company',
    label: 'Company',
    icon: Building2,
    component: CompanyTab,
    description: 'Manage company information and business hours'
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    component: TeamTab,
    description: 'Manage team members and permissions'
  },
  {
    id: 'work-orders',
    label: 'Work Orders',
    icon: Hash,
    component: WorkOrderNumberingTab,
    description: 'Configure work order numbering and settings'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    component: InventorySettingsTab,
    description: 'Manage inventory settings and preferences'
  },
  {
    id: 'diy-bays',
    label: 'DIY Bay Rates',
    icon: Wrench,
    component: DIYBayRatesTab,
    description: 'Set rates for DIY bay rentals'
  },
  {
    id: 'branding',
    label: 'Branding',
    icon: Palette,
    component: BrandingTab,
    description: 'Customize your brand appearance'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    component: NotificationsTab,
    description: 'Configure notification preferences'
  },
];

export const DEFAULT_SETTINGS_TAB = 'company';
