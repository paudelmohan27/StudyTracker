const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = {
  _handleFile(req, file, callback) {
    const upload = cloudinary.uploader.upload_stream(
      {
    folder: 'studytracker_avatars',
        resource_type: 'image',
        transformation: [{ width: 400, height: 400, crop: 'limit' }],
      },
      (error, result) => {
        if (error) return callback(error);

        callback(null, {
          filename: result.public_id,
          path: result.secure_url,
          size: result.bytes,
        });
      }
    );

    file.stream.pipe(upload);
  },
  _removeFile(req, file, callback) {
    if (!file.filename) return callback(null);
    cloudinary.uploader.destroy(file.filename, callback);
  },
};

const parser = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (allowedTypes.has(file.mimetype)) return callback(null, true);
    callback(new Error('Only JPEG, PNG, and WebP images are allowed'));
  },
});

module.exports = { cloudinary, parser };
