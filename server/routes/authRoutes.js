const express = require('express');
const router = express.Router();
const multer = require('multer');
const { registerUser, verifyOTP, loginUser } = require('../controllers/authController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.post('/register', upload.single('idImage'), registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);

module.exports = router;
