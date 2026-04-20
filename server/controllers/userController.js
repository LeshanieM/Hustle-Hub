const User = require("../models/User");
const badgeEngine = require('../utils/badgeEngine');
const { checkAndAwardBadges } = require('../services/badgeService');

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

const getUserBadges = async (req, res) => {
  try {
    // Always run a live sync first — this adds new earned badges AND removes
    // badges that are no longer valid (e.g. after orders cancelled / reviews deleted)
    await checkAndAwardBadges(req.params.id);

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrichedBadges = (user.badges || []).map(ub => {
      const config = badgeEngine.find(b => b.id === ub.badgeId);
      if (!config) return null;
      return {
        id: config.id,
        badgeId: ub.badgeId,
        label: config.label,
        icon: config.icon,
        description: config.description,
        earnedAt: ub.earnedAt
      };
    }).filter(Boolean);

    res.status(200).json(enrichedBadges);
  } catch (error) {
    console.error("Get User Badges Error:", error);
    res.status(500).json({ message: "Server error getting badges" });
  }
};

const toggleFavoriteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.savedItems.indexOf(productId);
    if (index === -1) {
      // Add to favorites
      user.savedItems.push(productId);
      await user.save();
      return res.json({ message: "Product added to favorites", isFavorite: true });
    } else {
      // Remove from favorites
      user.savedItems.splice(index, 1);
      await user.save();
      return res.json({ message: "Product removed from favorites", isFavorite: false });
    }
  } catch (error) {
    console.error("Toggle Favorite Error:", error);
    res.status(500).json({ message: "Server error during toggle favorite" });
  }
};

const getSavedItems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedItems");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ savedItems: user.savedItems });
  } catch (error) {
    console.error("Get Saved Items Error:", error);
    res.status(500).json({ message: "Server error fetching saved items" });
  }
};

module.exports = { 
  updateProfile, 
  getUserBadges, 
  toggleFavoriteProduct, 
  getSavedItems 
};