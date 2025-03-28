
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Clipboard,
  Home,
  Package,
  Settings,
  Users,
  BarChart,
  LogOut,
  Menu,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const mainMenu = [
  {
    title: 'Dashboard',
    path: '/',
    icon: Home,
  },
  {
    title: 'Work Orders',
    path: '/work-orders',
    icon: Clipboard,
  },
  {
    title: 'Invoices',
    path: '/invoices',
    icon: FileText,
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: Package,
  },
  {
    title: 'Team',
    path: '/team',
    icon: Users,
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: BarChart,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Sidebar
      className="border-r border-slate-200 bg-white"
      collapsible="icon"
    >
      <SidebarHeader className="py-4 px-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-esm-blue-600">Easy Shop Manager</span>
                <span className="text-xs text-slate-500">Work Order System</span>
              </div>
            )}
            {isCollapsed && (
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-esm-blue-600">ESM</span>
              </div>
            )}
          </Link>
          <SidebarTrigger
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-slate-100"
          >
            <Menu size={20} />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("px-4 text-xs font-semibold text-slate-500 uppercase", 
            isCollapsed ? "sr-only" : "")}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    className={cn("flex items-center gap-3 px-4 py-2 text-base text-slate-700 hover:bg-slate-100 rounded-md",
                      location.pathname === item.path && "bg-esm-blue-50 text-esm-blue-600 font-medium")}
                  >
                    <Link to={item.path}>
                      <item.icon className={cn("h-5 w-5", 
                        location.pathname === item.path ? "text-esm-blue-500" : "text-slate-500")} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 p-4">
        <Button variant="outline" className="w-full text-slate-700 flex items-center gap-2">
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

