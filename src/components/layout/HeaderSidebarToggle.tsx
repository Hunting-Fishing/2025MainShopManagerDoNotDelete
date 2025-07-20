
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderSidebarToggleProps {
  onClick?: () => void;
}

export function HeaderSidebarToggle({ onClick }: HeaderSidebarToggleProps) {
  const { toggle } = useSidebar();
  const isMobile = useIsMobile();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggle();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
