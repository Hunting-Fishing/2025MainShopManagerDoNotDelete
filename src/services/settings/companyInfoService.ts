
// Update the uploadLogo method to use the new shop_logos bucket
async uploadLogo(shopId: string, file: File) {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate a unique filename
    const fileName = `${shopId}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${shopId}/${fileName}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('shop_logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('shop_logos')
      .getPublicUrl(filePath);

    // Update shop record with logo URL
    const { error: updateError } = await supabase
      .from('shops')
      .update({ logo_url: publicUrl })
      .eq('id', shopId);

    if (updateError) {
      console.error('Shop update error:', updateError);
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error('Logo upload failed:', error);
    throw error;
  }
}
