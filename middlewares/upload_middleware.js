const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, callBack) => {
  if (file.mimetype.startsWith("image")) {
    callBack(null, true);
  } else {
    const error = new Error("Only image is acceptable");
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: storage, //storage decide a path where file will store in which folder
  limit: {
    fileSize: 1024 * 1024 * 5, // 5mb size limit set the limit of image like size etc
  },
  fileFilter: fileFilter, // which type of image allow
});
module.exports = upload;
