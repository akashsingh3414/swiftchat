import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_PUBLIC_URL, process.env.SUPABASE_API_KEY);

const uploadsDir = './uploads/';

export const uploadImageToSupabase = async (fileName) => {
    const filePath = path.join(uploadsDir, fileName);

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return null;
    }

    const fileBuffer = fs.readFileSync(filePath);

    const uniqueFileName = `${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
        .from('swiftchat')
        .upload(uniqueFileName, fileBuffer, {
            contentType: 'image/*',
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    const { data: publicURLData } = supabase
        .storage
        .from('swiftchat')
        .getPublicUrl(uniqueFileName);

    return { publicUrl: publicURLData.publicUrl, filePath: data.fullPath };
}

export const deleteImageFromSupabase = async (filePath) => {
    try {
      const pathInBucket = filePath.replace('swiftchat/', '');
    
      const { data, error } = await supabase
        .storage
        .from('swiftchat')
        .remove([pathInBucket]);
    
      if(error) {
        console.log('Error while deleting from supabase')
        return false;
      }
      return true;
    } catch (error) {
        console.log('Internal error while deleting from supabase')
        return false;
    }
  };