
import { supabase } from '@/lib/supabase';

export async function seedProductCategories() {
  const categories = [
    { name: 'Engine', slug: 'engine', description: 'Engine tools and components' },
    { name: 'Brakes', slug: 'brakes', description: 'Brake system tools and components' },
    { name: 'Steering & Suspension', slug: 'steering-suspension', description: 'Steering and suspension tools and components' },
    { name: 'Diagnostics', slug: 'diagnostics', description: 'Diagnostic tools and equipment' },
    { name: 'Electrical', slug: 'electrical', description: 'Electrical system tools and components' },
    { name: 'Heating', slug: 'heating', description: 'Heating system tools and components' },
    { name: 'Cooling', slug: 'cooling', description: 'Cooling system tools and components' }
  ];

  try {
    const { data, error } = await supabase
      .from('product_categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (error) throw error;
    console.log('Seeded categories:', data);
    return data;
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
}

export async function seedManufacturers() {
  const manufacturers = [
    { name: 'Craftsman', slug: 'craftsman', category: 'tools', description: 'Craftsman tools' },
    { name: 'Snap-on', slug: 'snap-on', category: 'tools', description: 'Snap-on tools' },
    { name: 'Autel', slug: 'autel', category: 'diagnostics', description: 'Autel diagnostic tools' },
    { name: 'Matco', slug: 'matco', category: 'tools', description: 'Matco tools' },
    { name: 'OTC', slug: 'otc', category: 'tools', description: 'OTC tools' }
  ];

  try {
    const { data, error } = await supabase
      .from('manufacturers')
      .upsert(manufacturers, { onConflict: 'slug' })
      .select();

    if (error) throw error;
    console.log('Seeded manufacturers:', data);
    return data;
  } catch (error) {
    console.error('Error seeding manufacturers:', error);
    throw error;
  }
}

export async function seedSampleProducts(categoryIds: Record<string, string>) {
  const products = [
    {
      title: 'Premium Socket Set', // Use title instead of name
      description: 'Complete socket set with ratchet and extensions',
      slug: 'premium-socket-set',
      price: 129.99,
      sale_price: 99.99,
      image_url: 'https://example.com/images/socket-set.jpg',
      category_id: categoryIds['Engine'],
      manufacturer: 'Craftsman',
      average_rating: 4.8,
      review_count: 152,
      is_featured: true,
      is_bestseller: true,
      affiliate_link: 'https://example.com/affiliate/socket-set',
      is_approved: true,
      is_available: true
    },
    {
      title: 'Torque Wrench', // Use title instead of name
      description: 'Precision torque wrench with digital display',
      slug: 'torque-wrench',
      price: 89.99,
      image_url: 'https://example.com/images/torque-wrench.jpg',
      category_id: categoryIds['Engine'],
      manufacturer: 'Snap-on',
      average_rating: 4.6,
      review_count: 98,
      is_featured: false,
      is_bestseller: false,
      affiliate_link: 'https://example.com/affiliate/torque-wrench',
      is_approved: true,
      is_available: true
    },
    {
      title: 'OBD-II Scanner', // Use title instead of name
      description: 'Advanced diagnostic scanner for all vehicles',
      slug: 'obd-ii-scanner',
      price: 149.99,
      sale_price: 129.99,
      image_url: 'https://example.com/images/scanner.jpg',
      category_id: categoryIds['Diagnostics'],
      manufacturer: 'Autel',
      average_rating: 4.9,
      review_count: 215,
      is_featured: true,
      is_bestseller: true,
      affiliate_link: 'https://example.com/affiliate/scanner',
      is_approved: true,
      is_available: true
    }
  ];

  try {
    const { data, error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'slug' })
      .select();

    if (error) throw error;
    console.log('Seeded products:', data);
    return data;
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    const categories = await seedProductCategories();
    console.log("Categories seeded");
    
    // Create a lookup of category IDs by name
    const categoryIds: Record<string, string> = {};
    categories.forEach(cat => {
      categoryIds[cat.name] = cat.id;
    });
    
    await seedManufacturers();
    console.log("Manufacturers seeded");
    
    await seedSampleProducts(categoryIds);
    console.log("Products seeded");
    
    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Database seeding failed:", error);
  }
}

export default seedDatabase;
