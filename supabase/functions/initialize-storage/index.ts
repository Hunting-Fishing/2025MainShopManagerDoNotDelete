
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the admin role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if the products bucket already exists
    const { data: buckets, error: listBucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (listBucketsError) {
      throw listBucketsError;
    }
    
    // If the products bucket doesn't exist, create it
    const productsBucketExists = buckets.some(bucket => bucket.name === 'products');
    
    if (!productsBucketExists) {
      const { data: newBucket, error: createBucketError } = await supabaseAdmin.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 5242880, // 5MB in bytes
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (createBucketError) {
        throw createBucketError;
      }
      
      console.log('Created products bucket:', newBucket);
    }
    
    // Create necessary folders
    const folders = ['product-images', 'category-images', 'manufacturer-logos'];
    
    for (const folder of folders) {
      // Create an empty file to simulate a folder (Supabase Storage uses a folder-like structure)
      const { error: uploadError } = await supabaseAdmin.storage
        .from('products')
        .upload(`${folder}/.keep`, new Uint8Array(), {
          contentType: 'text/plain',
          upsert: true
        });
      
      if (uploadError && uploadError.message !== 'The resource already exists') {
        console.error(`Error creating folder ${folder}:`, uploadError);
      }
    }
    
    return new Response(
      JSON.stringify({ message: 'Storage initialized successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error initializing storage:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
