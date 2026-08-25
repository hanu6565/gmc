import { supabase } from './supabase';

/**
 * Uploads an image file to Supabase Storage if available,
 * or converts it to a Base64 Data URL so it can be stored directly in Supabase DB
 * and displayed across all devices/visitors on Vercel.
 */
export const processImageUpload = async (file, bucketName = 'assets', folderPath = 'images') => {
  if (!file) return null;

  // Attempt Supabase Storage Upload
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;

    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      if (publicUrlData && publicUrlData.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase storage upload failed/not configured, falling back to Base64 Data URL:', err);
  }

  // Fallback: Convert to Base64 Data URL so it is accessible everywhere
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
