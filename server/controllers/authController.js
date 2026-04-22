const User = require("../models/User");
const TempUser = require("../models/TempUser");
const Store = require("../models/Store");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { extractStudentId } = require("../services/ocrService");
const { generateOTP } = require("../utils/generateOTP");
const { sendOTP } = require("../services/emailService");
const { logAction } = require("../utils/auditLogger");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret_fallback", {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, password, role } = req.body;

    if (!firstName || !lastName || !username || !password || !role) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Student ID image is required" });
    }

    const studentId = await extractStudentId(req.file.path);
    if (!studentId) {
      return res.status(400).json({
        message:
          "Could not detect a valid Student ID (e.g., IT24375659) from the image",
      });
    }

    const idExists = await User.findOne({ studentId });
    if (idExists) {
      return res
        .status(400)
        .json({ message: "An account with this Student ID already exists" });
    }

    const studentEmail = `${studentId}@my.sliit.lk`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const tempUser = await TempUser.create({
      username,
      studentId,
      firstName,
      lastName,
      studentEmail,
      password: hashedPassword,
      role,
      studentIdImage: req.file.path,
      otp,
      otpExpiry,
    });

    if (tempUser) {
      await sendOTP(tempUser.studentEmail, otp);
      res.status(201).json({
        message: "OTP Sent! Please verify to complete your registration.",
        studentEmail: tempUser.studentEmail,
        username: tempUser.username,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;

    const tempUser = await TempUser.findOne({ username });
    if (!tempUser) {
      return res.status(404).json({
        message:
          "No registration pending or OTP has timed out (10 minutes expired)",
      });
    }

    if (tempUser.otp !== otp || tempUser.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.create({
      username: tempUser.username,
      studentId: tempUser.studentId,
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      studentEmail: tempUser.studentEmail,
      password: tempUser.password,
      role: tempUser.role,
      studentIdImage: tempUser.studentIdImage,
      isVerified: true,
      isFirstLogin: true, // ✅ FIX: Ensures onboarding tour shows for ALL roles on first login
    });

    await logAction({
      action: `${user.role || "USER"} Registered`,
      type: "USER",
      target: user.username,
      icon: "person_add",
    });

    if (tempUser.role === "OWNER") {
      await Store.create({
        ownerId: user._id,
        storeName: `${user.username}'s Store`,
        description: `Welcome to ${user.username}'s official storefront!`,
        status: "ACTIVE",
      });
      await logAction({
        action: "Store CREATED",
        type: "STORE",
        target: `${user.username}'s Store`,
        icon: "storefront",
      });
    }

    await TempUser.deleteOne({ _id: tempUser._id });

    // Notify ADMINS
    const { sendNotification } = require('../services/notificationService');
    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    for (const admin of admins) {
        await sendNotification({
            recipientId: admin._id,
            actorId: user._id,
            type: 'NEW_VERIFICATION_REQUEST',
            title: 'New User Registered',
            message: `${user.firstName} ${user.lastName} has registered as a ${user.role}.`,
            category: 'systemUpdates',
            roleScope: 'ADMIN',
            entityType: 'user',
            entityId: user._id,
            link: `/admin/users`,
            required: true,
        });
    }

    res.status(200).json({
      message:
        "Account successfully registered and verified! You can now login.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your account first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // ✅ Only true if explicitly set to true — new registered users only
      const isFirstLogin = user.isFirstLogin === true;

      // ✅ Mark as no longer first login
      if (isFirstLogin) {
        await User.findByIdAndUpdate(user._id, { isFirstLogin: false });
      }

      res.json({
        _id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        studentEmail: user.studentEmail,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        isFirstLogin: isFirstLogin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = { registerUser, verifyOTP, loginUser };