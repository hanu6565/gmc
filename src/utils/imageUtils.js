import { supabase } from './supabase';

/**
 * Safely sets items in localStorage without throwing QuotaExceededError popups
 */
export const safeSetLocalStorage = (key, value) => {
  try {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringified);
  } catch (err) {
    console.warn(`LocalStorage quota reached for "${key}". Keeping data in React memory & DB:`, err);
  }
};

/**
 * Validates uploaded image files with detailed error messages for users
 */
export const validateImageFile = (file, maxMB = 15) => {
  if (!file) return { valid: false, message: '' };

  // 1. File Type Validation
  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(file.name);
  if (!isImage) {
    const ext = file.name.split('.').pop() || '알 수 없음';
    return {
      valid: false,
      message: `[업로드 불가 - 파일 형식 오류]\n이미지 파일(JPG, PNG, WEBP, GIF 등)만 업로드하실 수 있습니다.\n\n선택한 파일: ${file.name}\n파일 형식: .${ext}`
    };
  }

  // 2. File Size Validation
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const currentMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      message: `[업로드 불가 - 용량 초과]\n이미지 파일 크기가 ${maxMB}MB를 초과하여 업로드할 수 없습니다.\n\n선택한 이미지 용량: ${currentMB}MB\n허용 최대 용량: ${maxMB}MB 이하`
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validates uploaded video files with detailed error messages for users
 */
export const validateVideoFile = (file, maxMB = 100) => {
  if (!file) return { valid: false, message: '' };

  // 1. Video File Type Validation
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name);
  if (!isVideo) {
    const ext = file.name.split('.').pop() || '알 수 없음';
    return {
      valid: false,
      message: `[업로드 불가 - 파일 형식 오류]\n동영상 파일(MP4, WEBM 등)만 업로드하실 수 있습니다.\n\n선택한 파일: ${file.name}\n파일 형식: .${ext}`
    };
  }

  // 2. Video File Size Validation
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const currentMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      message: `[업로드 불가 - 용량 초과]\n동영상 파일 크기가 ${maxMB}MB를 초과하여 업로드할 수 없습니다.\n\n선택한 동영상 용량: ${currentMB}MB\n허용 최대 용량: ${maxMB}MB 이하`
    };
  }

  return { valid: true, message: '' };
};

/**
 * Compresses an image file on the client side before uploading to prevent DB bloat
 * and ensure fast page loads.
 * Scales down images larger than 1200px and compresses JPEG quality to 75%.
 */
export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image file to Supabase Storage if available,
 * or converts it to a Base64 Data URL so it can be stored directly in Supabase DB
 * and displayed across all devices/visitors on Vercel.
 */
export const processImageUpload = async (rawFile, bucketName = 'assets', folderPath = 'images') => {
  if (!rawFile) return null;

  // Compress image client-side if it's an image file
  const file = await compressImage(rawFile);

  // Attempt Supabase Storage Upload
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
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

  // Do NOT convert video files or large files (>2MB) to Base64 Data URLs,
  // as storing multi-MB Base64 strings in localStorage/DB JSON throws QuotaExceededError.
  if (file.type.startsWith('video/') || file.size > 2 * 1024 * 1024) {
    return null;
  }

  // Fallback for small images: Convert to Base64 Data URL so it is accessible everywhere
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
