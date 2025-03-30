
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/hooks/use-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import icons
import { 
  Menu, 
  Home, 
  Users, 
  Calendar, 
  ShoppingCart, 
  Truck, 
  Settings, 
  FileText,
  BarChart3,
  Mail,
  MailPlus
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
  submenu?: NavItem[];
}

export function AppSidebar() {
  const { isOpen, onOpen, onClose } = useSidebar();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Customers",
      href: "/customers",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Work Orders",
      href: "/work-orders",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: <ShoppingCart className="mr-2 h-4 w-4" />,
    },
    {
      title: "Vehicles",
      href: "/vehicles",
      icon: <Truck className="mr-2 h-4 w-4" />,
    },
    {
      title: "Marketing",
      href: "/email-templates",
      icon: <Mail className="mr-2 h-4 w-4" />,
      submenu: [
        {
          title: "Email Templates",
          href: "/email-templates",
          icon: <FileText className="mr-2 h-4 w-4" />,
        },
        {
          title: "Email Campaigns",
          href: "/email-campaigns",
          icon: <MailPlus className="mr-2 h-4 w-4" />,
        },
      ],
    },
    {
      title: "Analytics",
      href: "/customer-analytics",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      submenu: [
        {
          title: "Customer Analytics",
          href: "/customer-analytics",
          icon: <BarChart3 className="mr-2 h-4 w-4" />,
        },
        // Can add more analytics pages later
      ],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      disabled: true,
    },
  ];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpen}
            className="md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 pt-8">
          <div className="px-7">
            <Link to="/">
              <div className="flex items-center gap-2 font-semibold">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <span>Acme Co.</span>
              </div>
            </Link>
            <Separator className="my-6" />
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="flex flex-col space-y-2 px-7">
              {navItems.map((item) => (
                <div key={item.title}>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 rounded-md px-2.5 py-2 font-medium transition-all hover:bg-secondary/50",
                      location.pathname === item.href
                        ? "bg-secondary/50 font-semibold"
                        : "font-medium"
                    )}
                    disabled={item.disabled}
                  >
                    <Link to={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </Button>
                  {item.submenu && location.pathname.startsWith(item.href) && (
                    <div className="ml-4 mt-1 flex flex-col space-y-1">
                      {item.submenu.map((subItem) => (
                        <Button
                          key={subItem.title}
                          asChild
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2 rounded-md px-2.5 py-2 text-sm transition-all hover:bg-secondary/50",
                            location.pathname === subItem.href
                              ? "bg-secondary/50 font-semibold"
                              : "font-medium"
                          )}
                          disabled={subItem.disabled}
                        >
                          <Link to={subItem.href}>{subItem.title}</Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className="hidden h-full border-r md:block">
        <div className="px-7 py-6">
          <Link to="/">
            <div className="flex items-center gap-2 font-semibold">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span>Acme Co.</span>
            </div>
          </Link>
          <Separator className="my-6" />
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="flex flex-col space-y-2 px-7">
            {navItems.map((item) => (
              <div key={item.title}>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 rounded-md px-2.5 py-2 font-medium transition-all hover:bg-secondary/50",
                    location.pathname === item.href
                      ? "bg-secondary/50 font-semibold"
                      : "font-medium"
                  )}
                  disabled={item.disabled}
                >
                  <Link to={item.href}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </Button>
                {item.submenu && location.pathname.startsWith(item.href) && (
                  <div className="ml-4 mt-1 flex flex-col space-y-1">
                    {item.submenu.map((subItem) => (
                      <Button
                        key={subItem.title}
                        asChild
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2 rounded-md px-2.5 py-2 text-sm transition-all hover:bg-secondary/50",
                          location.pathname === subItem.href
                            ? "bg-secondary/50 font-semibold"
                            : "font-medium"
                        )}
                        disabled={subItem.disabled}
                      >
                        <Link to={subItem.href}>{subItem.title}</Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
