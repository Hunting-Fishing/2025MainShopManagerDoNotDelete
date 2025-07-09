
import { 
  Building2, 
  Users, 
  Bell, 
  Palette, 
  Package, 
  Wrench,
  Hash,
  HandHeart,
  Target,
  Calculator,
  Ticket,
  Globe,
  FileText,
  Shield,
  Database,
  Calendar
} from 'lucide-react';
import { CompanyTab } from '@/components/settings/CompanyTab';
import { TeamTab } from '@/components/settings/TeamTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { BrandingTab } from '@/components/settings/BrandingTab';
import { InventorySettingsTab } from '@/components/settings/InventorySettingsTab';
import { DIYBayRatesTab } from '@/components/settings/DIYBayRatesTab';
import { WorkOrderNumberingTab } from '@/components/settings/WorkOrderNumberingTab';
import { WorkOrderWorkflowTab } from '@/components/settings/WorkOrderWorkflowTab';
import { WorkOrderTemplateTab } from '@/components/settings/WorkOrderTemplateTab';
import { WorkOrderStatusTab } from '@/components/settings/WorkOrderStatusTab';
import { WorkOrderManagementTab } from '@/components/settings/WorkOrderManagementTab';
import { EnhancedWorkOrdersDashboard } from '@/components/settings/EnhancedWorkOrdersDashboard';
import { NonProfitTab } from '@/components/settings/NonProfitTab';
import { ProgramManagementTab } from '@/components/settings/ProgramManagementTab';
import { FinancialManagementTab } from '@/components/settings/FinancialManagementTab';
import { RaffleManagementTab } from '@/components/settings/RaffleManagementTab';
import { PublicPortalTab } from '@/components/settings/PublicPortalTab';
import { SettingsTabConfig } from '@/types/settingsConfig';
import { GrantManagementTab } from '@/components/settings/GrantManagementTab';
import { ImpactMeasurementTab } from '@/components/settings/ImpactMeasurementTab';
import { BoardMeetingTab } from '@/components/settings/BoardMeetingTab';
import { ComplianceTab } from '@/components/settings/ComplianceTab';
import { AssetTrackingTab } from '@/components/settings/AssetTrackingTab';
import { BudgetManagementTab } from '@/components/settings/BudgetManagementTab';

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
    component: WorkOrderManagementTab,
    description: 'Comprehensive work order settings, workflows, and automation'
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
  {
    id: 'nonprofit',
    label: 'Non-Profit',
    icon: HandHeart,
    component: NonProfitTab,
    description: 'Manage non-profit specific features and settings'
  },
  {
    id: 'programs',
    label: 'Program Management',
    icon: Target,
    component: ProgramManagementTab,
    description: 'Manage programs, volunteers, grants, and impact measurement'
  },
  {
    id: 'financial',
    label: 'Financial Management',
    icon: Calculator,
    component: FinancialManagementTab,
    description: 'Budget tracking, financial reporting, and compliance management'
  },
  {
    id: 'raffles',
    label: 'Raffle Management',
    icon: Ticket,
    component: RaffleManagementTab,
    description: 'Create and manage vehicle raffles and ticket sales'
  },
  {
    id: 'public-portal',
    label: 'Public Portal',
    icon: Globe,
    component: PublicPortalTab,
    description: 'Manage public-facing portal and application forms'
  },
  {
    id: 'grants',
    label: 'Grant Management',
    icon: HandHeart,
    component: GrantManagementTab,
    description: 'Track grant applications, deadlines, and reporting requirements'
  },
  {
    id: 'impact',
    label: 'Impact Measurement',
    icon: Target,
    component: ImpactMeasurementTab,
    description: 'Track and measure your nonprofit\'s community impact'
  },
  {
    id: 'board-meetings',
    label: 'Board Meetings',
    icon: Calendar,
    component: BoardMeetingTab,
    description: 'Manage board meetings, agendas, and minutes'
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: Shield,
    component: ComplianceTab,
    description: 'Track regulatory compliance requirements and deadlines'
  },
  {
    id: 'asset-tracking',
    label: 'Asset Tracking',
    icon: Database,
    component: AssetTrackingTab,
    description: 'Track and manage organizational assets and equipment'
  },
  {
    id: 'budget-management',
    label: 'Budget Management',
    icon: Calculator,
    component: BudgetManagementTab,
    description: 'Track budgets, expenses, and financial performance'
  },
];

export const DEFAULT_SETTINGS_TAB = 'company';
