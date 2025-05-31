
import { supabase } from '@/lib/supabase';

// All sample data generation has been removed to ensure real data usage only
// This file now serves as a placeholder for any future real data seeding needs

export async function seedProductCategories() {
  console.log('Sample data seeding has been disabled. Please add real data through the application interface.');
  return [];
}

export async function seedManufacturers() {
  console.log('Sample data seeding has been disabled. Please add real data through the application interface.');
  return [];
}

export async function seedSampleProducts(categoryIds: Record<string, string>) {
  console.log('Sample data seeding has been disabled. Please add real data through the application interface.');
  return [];
}

export async function seedDatabase() {
  console.log('All sample data seeding has been disabled. Use the application interface to add real inventory data.');
}

export default seedDatabase;
