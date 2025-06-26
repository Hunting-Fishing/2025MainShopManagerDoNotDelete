
import React from 'react';
import { CustomersPage as RefactoredCustomersPage } from '@/components/customers/CustomersPage';

/**
 * REFACTORED: Page wrapper using clean architecture
 * The CustomersPage component now follows SOLID principles:
 * - Single Responsibility: Each component has one clear purpose
 * - Open/Closed: Easy to extend with new features
 * - Liskov Substitution: Repository pattern allows different implementations
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Depends on abstractions, not concretions
 * 
 * Uses 100% live Supabase data with proper error handling and loading states
 */
export default function Customers() {
  return <RefactoredCustomersPage />;
}
