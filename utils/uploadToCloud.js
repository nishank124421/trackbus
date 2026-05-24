const cloudinary = require('../config/cloudinaryConfig');

const uploadToCloudinary = (fileBuffer, mimetype) => {
    return new Promise((resolve, reject) => {
        
        // Decide resource type based on what was uploaded
        let resourceType = 'image';
        if (mimetype.startsWith('video')) resourceType = 'video';
        if (mimetype === 'application/pdf') resourceType = 'raw';

        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'trackbus-evidence',  // stored in this folder on Cloudinary
                resource_type: resourceType 
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);  // returns the permanent URL of the file
                }
            }
        );

        uploadStream.end(fileBuffer);  // send the file buffer to Cloudinary
    });
};

module.exports = uploadToCloudinary;