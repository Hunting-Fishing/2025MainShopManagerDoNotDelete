import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { lazy, Suspense } from 'react';

// Lazy load settings pages
const CompanySettings = lazy(() => import('./settings/CompanySettings'));
const DashboardSettings = lazy(() => import('./settings/DashboardSettings'));
const TeamSettings = lazy(() => import('./settings/TeamSettings'));
const BrandingSettings = lazy(() => import('./settings/BrandingSettings'));
const NotificationSettings = lazy(() => import('./settings/NotificationSettings'));
const SecuritySettings = lazy(() => import('./settings/SecuritySettings'));
const WorkOrdersSettings = lazy(() => import('./settings/WorkOrdersSettings'));
const InventorySettings = lazy(() => import('./settings/InventorySettings'));
const DIYBaySettings = lazy(() => import('./settings/DIYBaySettings'));
const IntegrationsSettings = lazy(() => import('./settings/IntegrationsSettings'));
const NonProfitSettings = lazy(() => import('./settings/NonProfitSettings'));
const ProgramSettings = lazy(() => import('./settings/ProgramSettings'));
const VolunteerSettings = lazy(() => import('./settings/VolunteerSettings'));
const GrantSettings = lazy(() => import('./settings/GrantSettings'));
const FinancialSettings = lazy(() => import('./settings/FinancialSettings'));
const BudgetSettings = lazy(() => import('./settings/BudgetSettings'));
const AssetSettings = lazy(() => import('./settings/AssetSettings'));
const BoardMeetingSettings = lazy(() => import('./settings/BoardMeetingSettings'));
const ComplianceSettings = lazy(() => import('./settings/ComplianceSettings'));
const ImpactSettings = lazy(() => import('./settings/ImpactSettings'));
const RaffleSettings = lazy(() => import('./settings/RaffleSettings'));
const PublicPortalSettings = lazy(() => import('./settings/PublicPortalSettings'));
const RolePermissionsSettings = lazy(() => import('./settings/RolePermissionsSettings'));
const UserPermissionsSettings = lazy(() => import('./settings/UserPermissionsSettings'));

export default function Settings() {
  usePageTitle('Settings');

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Routes>
        <Route index element={<SettingsLayout />} />
        <Route path="company" element={<CompanySettings />} />
        <Route path="dashboard" element={<DashboardSettings />} />
        <Route path="team" element={<TeamSettings />} />
        <Route path="branding" element={<BrandingSettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="work-orders" element={<WorkOrdersSettings />} />
        <Route path="inventory" element={<InventorySettings />} />
        <Route path="diy-bays" element={<DIYBaySettings />} />
        <Route path="integrations" element={<IntegrationsSettings />} />
        <Route path="nonprofit" element={<NonProfitSettings />} />
        <Route path="programs" element={<ProgramSettings />} />
        <Route path="volunteers" element={<VolunteerSettings />} />
        <Route path="grants" element={<GrantSettings />} />
        <Route path="financial" element={<FinancialSettings />} />
        <Route path="budget-management" element={<BudgetSettings />} />
        <Route path="asset-tracking" element={<AssetSettings />} />
        <Route path="board-meetings" element={<BoardMeetingSettings />} />
        <Route path="compliance" element={<ComplianceSettings />} />
        <Route path="impact" element={<ImpactSettings />} />
        <Route path="raffles" element={<RaffleSettings />} />
        <Route path="public-portal" element={<PublicPortalSettings />} />
        <Route path="role-permissions" element={<RolePermissionsSettings />} />
        <Route path="user-permissions" element={<UserPermissionsSettings />} />
      </Routes>
    </Suspense>
  );
}
