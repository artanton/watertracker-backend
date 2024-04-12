import multer from "multer";
import path from "path";

import HttpError from "../helpers/HttpError.js";

const destination = path.resolve("temp");
const storage = multer.diskStorage({
  destination,
  filename: (req, file, callback) => {
    const uniquePrefix = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    const fileName = `${uniquePrefix}_${file.originalname}`;
    callback(null, fileName);
  },
});

const limits = {
  fileSize: 5 * 1024 * 1024,
};

const fileFilter = (req, file, callback) => {
  const extension = file.originalname.split(".").pop();
  if (extension === "exe") {
    callback(HttpError(400, ".exe files are not allowed"));
  }
  callback(null, true);
};

const upload = multer({ storage, limits, fileFilter });

export default upload;
