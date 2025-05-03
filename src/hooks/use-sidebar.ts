
import { useSidebar as useComponentSidebar } from "@/components/ui/sidebar";

export const useSidebar = () => {
  const { collapsed, toggleCollapsed } = useComponentSidebar();
  
  return {
    isOpen: !collapsed,
    onOpen: () => {
      if (collapsed) toggleCollapsed();
    },
    onClose: () => {
      if (!collapsed) toggleCollapsed();
    },
    toggle: toggleCollapsed
  };
};
