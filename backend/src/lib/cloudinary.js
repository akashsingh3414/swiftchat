import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadsDir = './';

export const uploadImageToCloudinary = async (fileName) => {
    const filePath = path.join(uploadsDir, fileName);

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return null;
    }

    try {
        const result = await cloudinary.v2.uploader.upload(filePath, {
            folder: 'swiftchat',
            resource_type: 'image'
        });

        fs.unlinkSync(filePath);

        return { publicUrl: result.secure_url, filePath: result.public_id };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null;
    }
};

export const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        const publicId = imageUrl
            .split('/')
            .slice(-2)
            .join('/')
            .replace(/\.[^/.]+$/, '');

        const { result } = await cloudinary.v2.uploader.destroy(publicId);

        if (result !== 'ok') {
            console.error('Error deleting from Cloudinary:', result);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Internal error while deleting from Cloudinary:', error);
        return false;
    }
};

