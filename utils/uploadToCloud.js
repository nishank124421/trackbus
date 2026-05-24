const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer, mimetype) => {
    return new Promise((resolve, reject) => {
        let resourceType = 'image';
        if (mimetype.startsWith('video')) resourceType = 'video';
        if (mimetype === 'application/pdf') resourceType = 'raw';
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'trackbus-evidence',
                resource_type: resourceType 
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

module.exports = uploadToCloudinary;