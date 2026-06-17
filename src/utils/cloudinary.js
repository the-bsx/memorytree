import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          console.log("❌ Cloudinary upload failed:", error);
          reject(error);
        } else {
          console.log("✅ Cloudinary upload successful:", {
            url: result.secure_url,
            publicId: result.public_id,
          });
          resolve(result);
        }
      },
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  const response = await cloudinary.uploader.destroy(publicId);
  return response;
};

export { uploadOnCloudinary, deleteFromCloudinary };
