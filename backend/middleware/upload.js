const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Basic accept rules based on the prompt
    if (file.fieldname === 'researchPaper' && file.mimetype !== 'application/pdf') {
      return cb(new Error('Research paper must be a PDF'));
    }
    if (file.fieldname === 'coverImage' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Cover image must be an image file'));
    }
    cb(null, true);
  }
});

module.exports = upload;
