import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../helpers/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the folder based on file properties or request data
    let folder;
    if (file.fieldname === "avatarURL") {
      folder = "avatars";
    } else if (file.fieldname === "documents") {
      folder = "documents";
    } else {
      folder = "misc";
    }
    return {
      folder,
      allowed_formats: ["jpg", "png", "webp", "jpeg"], // Adjust the allowed formats as needed
      public_id: req.user._id, // Use original filename as the public ID
      transformation: [
        { width: 350, height: 350, crop: "fill" },
        { width: 700, height: 700, crop: "fill" },
      ],
    };
  },
});

const upload = multer({ storage });

export default upload;
