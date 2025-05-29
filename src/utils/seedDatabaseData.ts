
import { supabase } from '@/lib/supabase';

// Database seeding functions have been removed to prevent sample data creation
// All data should come from real user input or API integrations

export async function seedProductCategories() {
  console.warn('Sample data seeding has been disabled. Please add real data through the application interface.');
  return [];
}

export async function seedManufacturers() {
  console.warn('Sample data seeding has been disabled. Please add real data through the application interface.');
  return [];
}

export async function seedSampleProducts(categoryIds: Record<string, string>) {
  console.warn('Sample data seeding has been disabled. Please add real data through the application interface.');
  return [];
}

export async function seedDatabase() {
  console.warn('Sample data seeding has been disabled. All data should be added through the application interface or real integrations.');
}

export default seedDatabase;
