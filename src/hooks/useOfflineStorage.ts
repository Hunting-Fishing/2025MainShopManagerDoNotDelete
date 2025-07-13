import { useState, useEffect } from 'react';

interface OfflineData {
  id: string;
  type: 'work_order' | 'inventory' | 'customer';
  data: any;
  timestamp: number;
  synced: boolean;
}

export function useOfflineStorage() {
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Initialize IndexedDB
  useEffect(() => {
    initializeDB();
    loadPendingChanges();
  }, []);

  const initializeDB = async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('OrderMasterOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  };

  const loadPendingChanges = async () => {
    try {
      const db = await initializeDB();
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      const request = index.count(IDBKeyRange.only(false));
      
      request.onsuccess = () => {
        setPendingChanges(request.result);
      };
    } catch (error) {
      console.error('Failed to load pending changes:', error);
    }
  };

  const saveOfflineData = async (type: OfflineData['type'], data: any) => {
    try {
      const db = await initializeDB();
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const offlineData: OfflineData = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        synced: false
      };
      
      await store.add(offlineData);
      setPendingChanges(prev => prev + 1);
      
      // Register background sync if available
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // Background sync registration would go here if supported
        } catch (error) {
          console.log('Background sync not available');
        }
      }
      
      return offlineData.id;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      throw error;
    }
  };

  const forcSync = async () => {
    setSyncStatus('syncing');
    
    try {
      const db = await initializeDB();
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false));
      
      request.onsuccess = async () => {
        const unsynced = request.result;
        
        for (const item of unsynced) {
          try {
            await syncSingleItem(item);
            
            // Mark as synced
            item.synced = true;
            await store.put(item);
            
            setPendingChanges(prev => Math.max(0, prev - 1));
          } catch (error) {
            console.error('Failed to sync item:', item.id, error);
          }
        }
        
        setSyncStatus('idle');
      };
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };

  const syncSingleItem = async (item: OfflineData) => {
    // This would implement the actual sync logic with your backend
    // For now, we'll simulate the sync process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (item.type) {
      case 'work_order':
        console.log('Syncing work order:', item.data);
        // Implement work order sync
        break;
      case 'inventory':
        console.log('Syncing inventory:', item.data);
        // Implement inventory sync
        break;
      case 'customer':
        console.log('Syncing customer:', item.data);
        // Implement customer sync
        break;
    }
  };

  const clearOfflineData = async () => {
    try {
      const db = await initializeDB();
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      await store.clear();
      setPendingChanges(0);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  };

  const getOfflineData = async (type?: OfflineData['type']) => {
    try {
      const db = await initializeDB();
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      if (type) {
        const index = store.index('type');
        const request = index.getAll(type);
        return new Promise<OfflineData[]>((resolve) => {
          request.onsuccess = () => resolve(request.result);
        });
      } else {
        const request = store.getAll();
        return new Promise<OfflineData[]>((resolve) => {
          request.onsuccess = () => resolve(request.result);
        });
      }
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return [];
    }
  };

  return {
    pendingChanges,
    syncStatus,
    saveOfflineData,
    forcSync,
    clearOfflineData,
    getOfflineData
  };
}