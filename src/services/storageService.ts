import { supabase } from '../lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: 'products')
 * @param folder - The folder path within the bucket (default: 'images')
 * @returns UploadResult with success status, public URL, and error message if any
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'products',
  folder: string = 'images'
): Promise<UploadResult> => {
  console.log('📤 [STORAGE] Starting image upload...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    bucket,
    folder
  });

  try {
    // Step 1: Validate authentication
    console.log('🔐 [STORAGE] Checking authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ [STORAGE] Session error:', sessionError);
      return {
        success: false,
        error: `Authentication error: ${sessionError.message}`
      };
    }

    if (!session) {
      console.error('❌ [STORAGE] No active session found');
      return {
        success: false,
        error: 'No active authentication session. Please login again.'
      };
    }

    console.log('✅ [STORAGE] Authentication verified for user:', session.user.id);

    // Step 2: Validate file
    console.log('🔍 [STORAGE] Validating file...');
    if (!file.type.startsWith('image/')) {
      console.error('❌ [STORAGE] Invalid file type:', file.type);
      return {
        success: false,
        error: 'File must be an image (PNG, JPG, GIF, etc.)'
      };
    }

    // Max file size 5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ [STORAGE] File too large:', file.size);
      return {
        success: false,
        error: 'File size must be less than 5MB'
      };
    }

    console.log('✅ [STORAGE] File validation passed');

    // Step 3: Generate unique filename with timestamp
    console.log('📝 [STORAGE] Generating unique filename...');
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFileName = file.name
      .split('.')[0]
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50); // Limit filename length

    const filePath = `${folder}/${safeFileName}-${timestamp}-${randomString}.${fileExtension}`;
    console.log('✅ [STORAGE] Generated file path:', filePath);

    // Step 4: Upload file to Supabase Storage
    console.log('🚀 [STORAGE] Uploading to Supabase Storage...');
    console.log('   Bucket:', bucket);
    console.log('   Path:', filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ [STORAGE] Upload failed:', uploadError);
      console.error('   Error message:', uploadError.message);
      console.error('   Error name:', uploadError.name);
      
      // Provide specific error messages based on error type
      if (uploadError.message.includes('bucket')) {
        return {
          success: false,
          error: `Storage bucket '${bucket}' not found. Please create it in Supabase dashboard.`
        };
      }
      
      if (uploadError.message.includes('permission') || uploadError.message.includes('policy')) {
        return {
          success: false,
          error: 'Permission denied: Check storage bucket RLS policies in Supabase.'
        };
      }

      if (uploadError.message.includes('size')) {
        return {
          success: false,
          error: 'File size exceeds storage limit.'
        };
      }

      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`
      };
    }

    console.log('✅ [STORAGE] File uploaded successfully:', uploadData);

    // Step 5: Get public URL
    console.log('🔗 [STORAGE] Getting public URL...');
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('❌ [STORAGE] Failed to get public URL');
      return {
        success: false,
        error: 'File uploaded but failed to get public URL',
        path: filePath
      };
    }

    console.log('✅ [STORAGE] Public URL obtained:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (err: any) {
    console.error('❌ [STORAGE] Unexpected error during upload:', err);
    console.error('   Error stack:', err?.stack);
    return {
      success: false,
      error: `Unexpected error: ${err?.message || 'Unknown error occurred'}`
    };
  }
};

/**
 * Delete an image from Supabase Storage
 * @param path - The file path to delete
 * @param bucket - The storage bucket name (default: 'products')
 * @returns UploadResult with success status
 */
export const deleteImage = async (
  path: string,
  bucket: string = 'products'
): Promise<UploadResult> => {
  console.log('🗑️ [STORAGE] Deleting image...', { path, bucket });

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('❌ [STORAGE] Delete failed:', error);
      return {
        success: false,
        error: `Delete failed: ${error.message}`
      };
    }

    console.log('✅ [STORAGE] Image deleted successfully');
    return {
      success: true
    };

  } catch (err: any) {
    console.error('❌ [STORAGE] Unexpected error during delete:', err);
    return {
      success: false,
      error: `Unexpected error: ${err?.message || 'Unknown error occurred'}`
    };
  }
};

/**
 * Check if storage bucket exists and is accessible
 * @param bucket - The storage bucket name
 * @returns boolean indicating if bucket is accessible
 */
export const checkBucketAccess = async (bucket: string = 'products'): Promise<boolean> => {
  console.log('🔍 [STORAGE] Checking bucket access:', bucket);

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1 });

    if (error) {
      console.error('❌ [STORAGE] Bucket access check failed:', error);
      return false;
    }

    console.log('✅ [STORAGE] Bucket is accessible');
    return true;

  } catch (err) {
    console.error('❌ [STORAGE] Bucket access check error:', err);
    return false;
  }
};
