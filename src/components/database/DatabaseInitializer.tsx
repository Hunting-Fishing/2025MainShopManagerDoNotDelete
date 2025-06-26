
import React, { useEffect, useState } from 'react';
import { startupDiagnostics } from '@/services/database/StartupDiagnostics';
import { databaseHealthMonitor } from '@/services/database/DatabaseHealthMonitor';
import { hardcodedWorkOrderService } from '@/services/workOrder/HardcodedWorkOrderService';

interface DatabaseInitializerProps {
  children: React.ReactNode;
}

export function DatabaseInitializer({ children }: DatabaseInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeDatabase = async () => {
      try {
        console.log('🚀 Initializing hardcoded database systems...');
        
        // Run startup diagnostics
        await startupDiagnostics.runStartupDiagnostics();
        
        // Pre-load work orders cache
        try {
          await hardcodedWorkOrderService.getAllWorkOrders();
          console.log('📦 Work orders cache pre-loaded');
        } catch (error) {
          console.warn('⚠️ Failed to pre-load work orders cache:', error);
        }
        
        if (mounted) {
          setIsInitialized(true);
          console.log('✅ Database initialization completed');
        }
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        if (mounted) {
          setInitializationError(error instanceof Error ? error.message : 'Unknown error');
          // Still set as initialized to allow the app to continue
          setIsInitialized(true);
        }
      }
    };

    initializeDatabase();

    return () => {
      mounted = false;
      // Cleanup monitoring on unmount
      databaseHealthMonitor.stopMonitoring();
    };
  }, []);

  // Show loading state briefly, then continue regardless
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing database systems...</p>
        </div>
      </div>
    );
  }

  // Log initialization error but continue
  if (initializationError) {
    console.error('⚠️ Database initialization had errors:', initializationError);
  }

  return <>{children}</>;
}
