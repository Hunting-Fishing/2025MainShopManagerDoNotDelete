import React from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';
import { OfflineManager } from './OfflineManager';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearch?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileLayout({
  children,
  title,
  showBack = false,
  showSearch = false,
  onSearch,
  rightAction
}: MobileLayoutProps) {
  const { isInstallable, isStandalone } = usePWA();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader
        title={title}
        showBack={showBack}
        showSearch={showSearch}
        showNotifications={true}
        showMenu={true}
        onSearch={onSearch}
        rightAction={rightAction}
      />

      {/* Offline Manager */}
      <OfflineManager />

      {/* PWA Install Prompt */}
      {isInstallable && !isStandalone && (
        <PWAInstallPrompt />
      )}

      {/* Main Content */}
      <main className={cn(
        "mobile-container",
        "min-h-[calc(100vh-3.5rem-4rem)]", // Account for header and bottom nav
        "p-4"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
