const express = require('express');
const router = express.Router();
const multer = require('multer');
const { updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

module.exports = router;
