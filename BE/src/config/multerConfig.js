const multer = require("multer");
const path = require("path");
const fs = require("fs");

const imagesDir = path.join(process.cwd(), `${process.env.IMG_PATH}`);
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|svg|avif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed (jpeg, jpg, png, gif, webp, bmp, tiff, svg, avif)"
      )
    );
  }
};

const image = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter,
});

const deleteImageByName = (fileName, message) => {
  const filePath = path.join(imagesDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log("File does not exist");
    return;
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(`${message} : ${err.message}`);
    }
  });
};

function deleteImageByPath(filePath, message) {
  if (!fs.existsSync(filePath)) {
    console.log("File does not exist");
    return;
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(`${message} : ${err.message}`);
    }
  });
}

module.exports = { image, deleteImageByName, deleteImageByPath };
