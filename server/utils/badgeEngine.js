const badgeEngine = [
  // 🛒 Shopper
  {
    id: "firstPick",
    label: "First Pick",
    icon: "🛒",
    description: "Welcome to the club! You made your first order.",
    condition: (stats) => stats.orderCount >= 1,
  },
  {
    id: "beginnerShopper",
    label: "Beginner Shopper",
    icon: "🛍️",
    description: "Keep it going! You've made 3 orders.",
    condition: (stats) => stats.orderCount >= 3,
  },
  {
    id: "proShopper",
    label: "Pro Shopper",
    icon: "💳",
    description: "You're a natural. 6 orders made.",
    condition: (stats) => stats.orderCount >= 6,
  },
  {
    id: "proMaxMember",
    label: "Pro Max Member",
    icon: "🌟",
    description: "Incredible! You've reached 10 orders.",
    condition: (stats) => stats.orderCount >= 10,
  },
  {
    id: "campusLegend",
    label: "Campus Legend",
    icon: "🏆",
    description: "A true Hustle Hub legend. 25 orders!",
    condition: (stats) => stats.orderCount >= 25,
  },

  // ⭐ Review
  {
    id: "firstVoice",
    label: "First Voice",
    icon: "⭐",
    description: "You've left your first review.",
    condition: (stats) => stats.reviewCount >= 1,
  },
  {
    id: "communityReviewer",
    label: "Community Reviewer",
    icon: "🗣️",
    description: "Helping others decide! 5 reviews left.",
    condition: (stats) => stats.reviewCount >= 5,
  },
  {
    id: "reviewGuru",
    label: "Review Guru",
    icon: "🧠",
    description: "Your opinion matters a lot. 10 reviews!",
    condition: (stats) => stats.reviewCount >= 10,
  },

  // 🏪 Seller
  {
    id: "hustlerBorn",
    label: "Hustler Born",
    icon: "🏪",
    description: "Your journey begins. First product listed.",
    condition: (stats) => stats.productCount >= 1,
  },
  {
    id: "firstSale",
    label: "First Sale",
    icon: "💰",
    description: "Cha-ching! You made your first confirmed sale.",
    condition: (stats) => stats.saleCount >= 1,
  },
  {
    id: "risingSeller",
    label: "Rising Seller",
    icon: "📈",
    description: "You're getting the hang of this. 5 sales made.",
    condition: (stats) => stats.saleCount >= 5,
  },
  {
    id: "topHustler",
    label: "Top Hustler",
    icon: "💯",
    description: "A true merchant. 15 confirmed sales!",
    condition: (stats) => stats.saleCount >= 15,
  },

  // 🤝 Loyalty
  {
    id: "loyalRegular",
    label: "Loyal Regular",
    icon: "🤝",
    description: "You love this shop! 3 orders from the same storefront.",
    condition: (stats) => stats.topStorefrontOrderCount >= 3,
  },
  {
    id: "campusVeteran",
    label: "Campus Veteran",
    icon: "🎓",
    description: "You've been using Hustle Hub for 30+ days.",
    condition: (stats) => stats.accountAgeDays >= 30,
  },
  {
    id: "completeProfile",
    label: "Complete Profile",
    icon: "✅",
    description: "You've filled out all major profile details.",
    condition: (stats) => stats.profileComplete,
  },
];

module.exports = badgeEngine;
