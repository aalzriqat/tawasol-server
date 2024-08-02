import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// @route   POST /api/profiles/upload
// @desc    Upload profile image
// @access  Public or Private depending on your needs
router.post('/upload', upload.single('profileImage'), (req, res) => {
    console.log('Upload route hit');
  try {
    res.json({ filePath: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

export default router;
