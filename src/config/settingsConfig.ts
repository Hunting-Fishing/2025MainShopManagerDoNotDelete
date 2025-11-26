
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
  Calendar,
  Link,
  UserCheck,
  LayoutDashboard,
  Lock,
  UserCog
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
import { SettingsTabConfig, SettingsSection } from '@/types/settingsConfig';
import { GrantManagementTab } from '@/components/settings/GrantManagementTab';
import { ImpactMeasurementTab } from '@/components/settings/ImpactMeasurementTab';
import { BoardMeetingTab } from '@/components/settings/BoardMeetingTab';
import { ComplianceTab } from '@/components/settings/ComplianceTab';
import { SecurityTab } from '@/components/settings/SecurityTab';
import { AssetTrackingTab } from '@/components/settings/AssetTrackingTab';
import { BudgetManagementTab } from '@/components/settings/BudgetManagementTab';
import { IntegrationsTab } from '@/components/settings/IntegrationsTab';
import { VolunteerManagementTab } from '@/components/settings/VolunteerManagementTab';
import { DashboardSettingsTab } from '@/components/settings/DashboardSettingsTab';
import { RolePermissionsSettingsTab } from '@/components/settings/RolePermissionsSettingsTab';
import { UserPermissionsSettingsTab } from '@/components/settings/UserPermissionsSettingsTab';

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'basic',
    title: 'Basic Settings',
    description: 'Core business and team configuration',
    tabs: [
      {
        id: 'company',
        label: 'Company',
        icon: Building2,
        component: CompanyTab,
        path: '/settings/company',
        description: 'Manage company information and business hours'
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        component: DashboardSettingsTab,
        path: '/settings/dashboard',
        description: 'Customize dashboard layout and widgets'
      },
      {
        id: 'team',
        label: 'Team',
        icon: Users,
        component: TeamTab,
        path: '/settings/team',
        description: 'Manage team members and permissions'
      },
      {
        id: 'branding',
        label: 'Branding',
        icon: Palette,
        component: BrandingTab,
        path: '/settings/branding',
        description: 'Customize your brand appearance'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        component: NotificationsTab,
        path: '/settings/notifications',
        description: 'Configure notification preferences'
      },
      {
        id: 'security',
        label: 'Security',
        icon: Shield,
        component: SecurityTab,
        path: '/settings/security',
        description: 'Password and authentication settings'
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    description: 'Day-to-day business operations and workflows',
    tabs: [
      {
        id: 'work-orders',
        label: 'Work Orders',
        icon: Hash,
        component: WorkOrderManagementTab,
        path: '/settings/work-orders',
        description: 'Comprehensive work order settings, workflows, and automation'
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: Package,
        component: InventorySettingsTab,
        path: '/settings/inventory',
        description: 'Manage inventory settings and preferences'
      },
      {
        id: 'diy-bays',
        label: 'DIY Bay Rates',
        icon: Wrench,
        component: DIYBayRatesTab,
        path: '/settings/diy-bays',
        description: 'Set rates for DIY bay rentals'
      },
      {
        id: 'integrations',
        label: 'Integrations',
        icon: Link,
        component: IntegrationsTab,
        path: '/settings/integrations',
        description: 'Connect external services and manage API integrations'
      }
    ]
  },
  {
    id: 'nonprofit',
    title: 'Non-Profit Management',
    description: 'Tools and features specifically for non-profit organizations',
    tabs: [
      {
        id: 'nonprofit',
        label: 'Non-Profit Settings',
        icon: HandHeart,
        component: NonProfitTab,
        path: '/settings/nonprofit',
        description: 'Manage non-profit specific features and settings'
      },
      {
        id: 'programs',
        label: 'Program Management',
        icon: Target,
        component: ProgramManagementTab,
        path: '/settings/programs',
        description: 'Manage programs, volunteers, grants, and impact measurement'
      },
      {
        id: 'volunteers',
        label: 'Volunteer Management',
        icon: UserCheck,
        component: VolunteerManagementTab,
        path: '/settings/volunteers',
        description: 'Manage volunteers, skills tracking, and assignment workflows'
      },
      {
        id: 'grants',
        label: 'Grant Management',
        icon: FileText,
        component: GrantManagementTab,
        path: '/settings/grants',
        description: 'Track grant applications, deadlines, and reporting requirements'
      },
      {
        id: 'financial',
        label: 'Financial Management',
        icon: Calculator,
        component: FinancialManagementTab,
        path: '/settings/financial',
        description: 'Budget tracking, financial reporting, and compliance management'
      },
      {
        id: 'budget-management',
        label: 'Budget Management',
        icon: Calculator,
        component: BudgetManagementTab,
        path: '/settings/budget-management',
        description: 'Track budgets, expenses, and financial performance'
      },
      {
        id: 'asset-tracking',
        label: 'Asset Tracking',
        icon: Database,
        component: AssetTrackingTab,
        path: '/settings/asset-tracking',
        description: 'Track and manage organizational assets and equipment'
      },
      {
        id: 'board-meetings',
        label: 'Board Meetings',
        icon: Calendar,
        component: BoardMeetingTab,
        path: '/settings/board-meetings',
        description: 'Manage board meetings, agendas, and minutes'
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: Shield,
        component: ComplianceTab,
        path: '/settings/compliance',
        description: 'Track regulatory compliance requirements and deadlines'
      },
      {
        id: 'impact',
        label: 'Impact Measurement',
        icon: Target,
        component: ImpactMeasurementTab,
        path: '/settings/impact',
        description: 'Track and measure your nonprofit\'s community impact'
      },
      {
        id: 'raffles',
        label: 'Raffle Management',
        icon: Ticket,
        component: RaffleManagementTab,
        path: '/settings/raffles',
        description: 'Create and manage vehicle raffles and ticket sales'
      }
    ]
  },
  {
    id: 'public',
    title: 'Public Interface',
    description: 'Customer-facing features and portals',
    tabs: [
      {
        id: 'public-portal',
        label: 'Public Portal',
        icon: Globe,
        component: PublicPortalTab,
        path: '/settings/public-portal',
        description: 'Manage public-facing portal and application forms'
      }
    ]
  },
  {
    id: 'access-control',
    title: 'Access Control',
    description: 'Manage user roles, permissions, and access rights',
    tabs: [
      {
        id: 'role-permissions',
        label: 'Role Permissions',
        icon: Shield,
        component: RolePermissionsSettingsTab,
        path: '/settings/role-permissions',
        description: 'Configure default permissions for each role'
      },
      {
        id: 'user-permissions',
        label: 'User Permissions',
        icon: UserCog,
        component: UserPermissionsSettingsTab,
        path: '/settings/user-permissions',
        description: 'Override permissions for individual users'
      }
    ]
  }
];

// Flatten sections into a single array for compatibility
export const SETTINGS_TABS: SettingsTabConfig[] = SETTINGS_SECTIONS.flatMap(section => section.tabs);

export const DEFAULT_SETTINGS_TAB = 'company';
