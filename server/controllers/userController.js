const User = require("../models/User");

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, studentEmail, removePhoto } = req.body;

    // Find user by id from protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName && firstName.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "First name must be at least 2 characters" });
    }
    if (lastName && lastName.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Last name must be at least 2 characters" });
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 10 digits" });
    }

    // Update fields if they are provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (studentEmail) user.studentEmail = studentEmail;

    if (removePhoto === "true") {
      user.profilePicture = "";
    }

    // If file is uploaded, update profile picture
    if (req.file) {
      user.profilePicture = req.file.path;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      studentEmail: updatedUser.studentEmail,
      phone: updatedUser.phone,
      profilePicture: updatedUser.profilePicture,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

module.exports = { updateProfile };
