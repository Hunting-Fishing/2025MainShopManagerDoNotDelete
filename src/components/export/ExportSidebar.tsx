import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Factory, Lock, MapPin, ArrowDownToLine, PackageCheck, ShieldCheck, Bell, RotateCcw, Landmark, CalendarDays, ShieldAlert, Anchor, Globe2, CreditCard, FileCheck, Hash, Package as PackageIcon, Navigation, Container, GitBranch, TrendingUp, FileStack, FileBadge, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Truck,
  UserCheck,
  Route,
  Receipt,
  Ship,
  FileText,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
  Cog,
  Car,
  Warehouse,
  BarChart3,
  Globe,
  Boxes,
  Settings,
  Wrench,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/export', icon: LayoutDashboard, color: 'from-emerald-500 to-teal-600' },
      { title: 'Alerts', href: '/export/notifications', icon: Bell, color: 'from-red-500 to-rose-600' },
      { title: 'Trade Alerts', href: '/export/trade-alerts', icon: BellRing, color: 'from-orange-500 to-red-500' },
      { title: 'Reports', href: '/export/reports', icon: BarChart3, color: 'from-cyan-500 to-blue-600' },
      { title: 'Activity Log', href: '/export/activity', icon: ClipboardCheck, color: 'from-slate-500 to-zinc-600' },
    ],
  },
  {
    title: 'Orders & Requests',
    items: [
      { title: 'Orders', href: '/export/orders', icon: ClipboardList, color: 'from-blue-500 to-cyan-500' },
      { title: 'Requests', href: '/export/requests', icon: ClipboardCheck, color: 'from-orange-500 to-amber-500' },
      { title: 'Shipments', href: '/export/shipments', icon: Ship, color: 'from-indigo-500 to-violet-600' },
      { title: 'Completions', href: '/export/completions', icon: BarChart3, color: 'from-green-500 to-emerald-600' },
      { title: 'Quotes', href: '/export/quotes', icon: FileText, color: 'from-pink-500 to-rose-500' },
      { title: 'Contracts', href: '/export/contracts', icon: FileText, color: 'from-violet-500 to-purple-600' },
      { title: 'Returns & Claims', href: '/export/returns', icon: RotateCcw, color: 'from-rose-500 to-red-600' },
      { title: 'Samples', href: '/export/samples', icon: PackageIcon, color: 'from-teal-500 to-cyan-600' },
    ],
  },
  {
    title: 'Customers & Products',
    items: [
      { title: 'Clients', href: '/export/customers', icon: Users, color: 'from-sky-500 to-blue-600' },
      { title: 'Suppliers', href: '/export/suppliers', icon: Factory, color: 'from-orange-500 to-red-500' },
      { title: 'Agents', href: '/export/agents', icon: Users, color: 'from-violet-500 to-purple-600' },
      { title: 'Products', href: '/export/products', icon: Package, color: 'from-amber-500 to-orange-600' },
      { title: 'Vehicles', href: '/export/vehicles', icon: Car, color: 'from-red-500 to-rose-600' },
      { title: 'Credit Mgmt', href: '/export/credit', icon: CreditCard, color: 'from-emerald-500 to-green-600' },
    ],
  },
  {
    title: 'Fleet & Logistics',
    items: [
      { title: 'Trucks', href: '/export/trucks', icon: Truck, color: 'from-slate-500 to-zinc-600' },
      { title: 'Drivers', href: '/export/drivers', icon: UserCheck, color: 'from-green-500 to-emerald-600' },
      { title: 'Driver App', href: '/export/driver-app', icon: Globe, color: 'from-orange-500 to-amber-600' },
      { title: 'Routes', href: '/export/routes', icon: Route, color: 'from-emerald-500 to-teal-500' },
      { title: 'Insurance', href: '/export/insurance', icon: ShieldCheck, color: 'from-cyan-500 to-blue-500' },
      { title: 'Forwarders', href: '/export/forwarders', icon: Truck, color: 'from-purple-500 to-indigo-600' },
      { title: 'Bookings', href: '/export/bookings', icon: Anchor, color: 'from-blue-500 to-indigo-600' },
      { title: 'Ports', href: '/export/ports', icon: Navigation, color: 'from-sky-500 to-blue-600' },
      { title: 'Intermodal', href: '/export/intermodal', icon: GitBranch, color: 'from-violet-500 to-indigo-600' },
      { title: 'Quality Control', href: '/export/quality', icon: ClipboardCheck, color: 'from-teal-500 to-cyan-600' },
    ],
  },
  {
    title: 'Inventory & Warehouses',
    items: [
      { title: 'Inventory', href: '/export/inventory', icon: Boxes, color: 'from-teal-500 to-cyan-600' },
      { title: 'Reservations', href: '/export/reservations', icon: Lock, color: 'from-amber-500 to-yellow-600' },
      { title: 'Warehouses', href: '/export/warehouses', icon: Warehouse, color: 'from-violet-500 to-purple-600' },
      { title: 'Packaging', href: '/export/packaging', icon: Package, color: 'from-lime-500 to-green-600' },
      { title: 'Packing & Trace', href: '/export/packing', icon: MapPin, color: 'from-teal-500 to-emerald-600' },
      { title: 'Bonded Storage', href: '/export/bonded-warehouses', icon: Container, color: 'from-indigo-500 to-purple-600' },
      { title: 'Equipment', href: '/export/equipment', icon: Wrench, color: 'from-gray-500 to-slate-600' },
    ],
  },
  {
    title: 'Documents & Compliance',
    items: [
      { title: 'Documents', href: '/export/documents', icon: FileText, color: 'from-fuchsia-500 to-pink-600' },
      { title: 'Doc Templates', href: '/export/doc-templates', icon: FileStack, color: 'from-pink-500 to-fuchsia-600' },
      { title: 'Customs', href: '/export/customs', icon: ShieldCheck, color: 'from-purple-500 to-violet-600' },
      { title: 'Declarations', href: '/export/declarations', icon: FileBadge, color: 'from-violet-500 to-purple-600' },
      { title: 'Certificates', href: '/export/certificates', icon: FileCheck, color: 'from-emerald-500 to-teal-600' },
      { title: 'HS Codes', href: '/export/hs-codes', icon: Hash, color: 'from-indigo-500 to-blue-600' },
      { title: 'Country Reqs', href: '/export/country-requirements', icon: Globe2, color: 'from-sky-500 to-blue-600' },
      { title: 'Compliance Calendar', href: '/export/compliance-calendar', icon: CalendarDays, color: 'from-orange-500 to-red-600' },
      { title: 'Sanctions', href: '/export/sanctions', icon: ShieldAlert, color: 'from-red-500 to-rose-600' },
    ],
  },
  {
    title: 'Billing & Finance',
    items: [
      { title: 'Invoices', href: '/export/invoices', icon: Receipt, color: 'from-purple-500 to-indigo-600' },
      { title: 'Payments', href: '/export/payments', icon: DollarSign, color: 'from-emerald-500 to-green-600' },
      { title: 'Pricing', href: '/export/pricing', icon: DollarSign, color: 'from-amber-500 to-orange-600' },
      { title: 'Currency', href: '/export/currency', icon: ArrowDownToLine, color: 'from-cyan-500 to-teal-600' },
      { title: 'Letters of Credit', href: '/export/letters-of-credit', icon: Landmark, color: 'from-indigo-500 to-blue-600' },
      { title: 'Duty Drawbacks', href: '/export/duty-drawbacks', icon: Receipt, color: 'from-lime-500 to-emerald-600' },
      { title: 'Bank Guarantees', href: '/export/bank-guarantees', icon: Shield, color: 'from-slate-500 to-zinc-600' },
      { title: 'Trade Finance', href: '/export/trade-finance', icon: TrendingUp, color: 'from-cyan-500 to-emerald-600' },
      { title: 'Shipment P&L', href: '/export/shipment-pl', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    ],
  },
  {
    title: 'Import',
    items: [
      { title: 'Purchase Orders', href: '/export/import-orders', icon: ArrowDownToLine, color: 'from-blue-500 to-indigo-600' },
      { title: 'Receiving', href: '/export/import-receiving', icon: PackageCheck, color: 'from-green-500 to-emerald-600' },
      { title: 'Customs Clearance', href: '/export/import-customs', icon: ShieldCheck, color: 'from-purple-500 to-indigo-600' },
      { title: 'Invoices (AP)', href: '/export/import-invoices', icon: Receipt, color: 'from-blue-500 to-cyan-600' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { title: 'Staff', href: '/export/staff', icon: Users, color: 'from-cyan-500 to-blue-500' },
      { title: 'Settings', href: '/export/settings', icon: Cog, color: 'from-slate-500 to-gray-600' },
    ],
  },
];

interface ExportSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function ExportSidebar({ collapsed = false, onToggle }: ExportSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (href: string) => {
    if (href === '/export') return currentPath === '/export';
    return currentPath.startsWith(href);
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-40 h-full transition-all duration-300 flex flex-col',
        'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Globe className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <div>
                <h2 className="font-semibold text-white tracking-tight truncate max-w-[140px]">
                  Export Company
                </h2>
                <p className="text-xs text-slate-400">Management Module</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto relative p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Globe className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
          )}
        </div>
      </div>

      {/* Back to Main */}
      <div className="p-3 border-b border-slate-700/50">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={cn(
            'w-full group transition-all duration-200',
            'text-slate-300 hover:text-white hover:bg-slate-800/50',
            collapsed ? 'justify-center' : 'justify-start gap-2'
          )}
          onClick={() => navigate('/dashboard')}
        >
          <div className="p-1.5 rounded-lg bg-slate-700/50 group-hover:bg-slate-600/50 transition-colors">
            <Home className="h-4 w-4" />
          </div>
          {!collapsed && <span className="text-sm">Back to Main</span>}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <button
                      key={item.href}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                        active
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-white shadow-lg shadow-emerald-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      )}
                      onClick={() => navigate(item.href)}
                      title={collapsed ? item.title : undefined}
                    >
                      <div className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        active
                          ? `bg-gradient-to-br ${item.color} shadow-lg`
                          : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                      )}>
                        <item.icon className={cn(
                          'h-4 w-4 transition-all duration-200',
                          active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        )} />
                      </div>
                      {!collapsed && (
                        <span className={cn('text-sm font-medium transition-all duration-200', active && 'text-white')}>
                          {item.title}
                        </span>
                      )}
                      {active && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Toggle Button */}
      <div className="p-3 border-t border-slate-700/50">
        <Button
          variant="ghost"
          size="icon"
          className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Ambient glow */}
      <div className="absolute top-20 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
    </div>
  );
}
