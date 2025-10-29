import React from "react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import AchievementCard from "../components/AchievementCard.jsx";

const achievementsData = [
  {
    id: 1,
    title: "First Steps",
    description: "Log your first transaction",
    icon: "👶",
    color: "from-blue-400 to-blue-600",
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    category: "Getting Started"
  },
  {
    id: 2,
    title: "Early Bird",
    description: "Log a transaction before 8 AM",
    icon: "🌅",
    color: "from-orange-400 to-pink-500",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: "Getting Started"
  },
  {
    id: 3,
    title: "Night Owl",
    description: "Log a transaction after 10 PM",
    icon: "🦉",
    color: "from-indigo-400 to-purple-600",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: "Getting Started"
  },

  {
    id: 4,
    title: "Getting Started",
    description: "Log 10 transactions",
    icon: "📝",
    color: "from-green-400 to-emerald-600",
    unlocked: true,
    progress: 10,
    maxProgress: 10,
    category: "Transactions"
  },
  {
    id: 5,
    title: "Consistent Logger",
    description: "Log 50 transactions",
    icon: "📊",
    color: "from-cyan-400 to-blue-600",
    unlocked: false,
    progress: 35,
    maxProgress: 50,
    category: "Transactions"
  },
  {
    id: 6,
    title: "Transaction Master",
    description: "Log 100 transactions",
    icon: "💎",
    color: "from-purple-400 to-pink-600",
    unlocked: false,
    progress: 35,
    maxProgress: 100,
    category: "Transactions"
  },
  {
    id: 7,
    title: "Data Wizard",
    description: "Log 500 transactions",
    icon: "🧙",
    color: "from-violet-400 to-purple-600",
    unlocked: false,
    progress: 35,
    maxProgress: 500,
    category: "Transactions"
  },

  {
    id: 8,
    title: "Streak Starter",
    description: "Log transactions for 3 days in a row",
    icon: "🔥",
    color: "from-red-400 to-orange-500",
    unlocked: true,
    progress: 3,
    maxProgress: 3,
    category: "Streaks"
  },
  {
    id: 9,
    title: "Week Warrior",
    description: "Log transactions for 7 days in a row",
    icon: "⚡",
    color: "from-yellow-400 to-orange-500",
    unlocked: false,
    progress: 5,
    maxProgress: 7,
    category: "Streaks"
  },
  {
    id: 10,
    title: "Monthly Master",
    description: "Log transactions for 30 days in a row",
    icon: "🏆",
    color: "from-amber-400 to-yellow-600",
    unlocked: false,
    progress: 5,
    maxProgress: 30,
    category: "Streaks"
  },
  {
    id: 11,
    title: "Unstoppable",
    description: "Log transactions for 100 days in a row",
    icon: "👑",
    color: "from-yellow-400 to-amber-600",
    unlocked: false,
    progress: 5,
    maxProgress: 100,
    category: "Streaks"
  },

  {
    id: 12,
    title: "Penny Pincher",
    description: "Stay under budget for a week",
    icon: "🐷",
    color: "from-pink-400 to-rose-500",
    unlocked: false,
    progress: 3,
    maxProgress: 7,
    category: "Savings"
  },
  {
    id: 13,
    title: "Budget Boss",
    description: "Stay under budget for a month",
    icon: "💰",
    color: "from-green-400 to-teal-500",
    unlocked: false,
    progress: 0,
    maxProgress: 30,
    category: "Savings"
  },
  {
    id: 14,
    title: "Savings Superstar",
    description: "Save $1000 or more",
    icon: "⭐",
    color: "from-yellow-300 to-yellow-600",
    unlocked: false,
    progress: 450,
    maxProgress: 1000,
    category: "Savings"
  },
  {
    id: 15,
    title: "Financial Freedom",
    description: "Save $10,000 or more",
    icon: "🌟",
    color: "from-yellow-400 to-amber-500",
    unlocked: false,
    progress: 450,
    maxProgress: 10000,
    category: "Savings"
  },

  {
    id: 16,
    title: "Category Creator",
    description: "Create 5 custom categories",
    icon: "🏷️",
    color: "from-indigo-400 to-blue-500",
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    category: "Organization"
  },
  {
    id: 17,
    title: "Organization Expert",
    description: "Log transactions in 10 different categories",
    icon: "📂",
    color: "from-blue-400 to-cyan-500",
    unlocked: false,
    progress: 6,
    maxProgress: 10,
    category: "Organization"
  },

  {
    id: 18,
    title: "Weekend Warrior",
    description: "Log 20 transactions on weekends",
    icon: "🎉",
    color: "from-purple-400 to-pink-500",
    unlocked: false,
    progress: 12,
    maxProgress: 20,
    category: "Special"
  },
  {
    id: 19,
    title: "Meal Tracker",
    description: "Log 50 food expenses",
    icon: "🍔",
    color: "from-red-400 to-orange-400",
    unlocked: false,
    progress: 28,
    maxProgress: 50,
    category: "Special"
  },
  {
    id: 20,
    title: "Explorer",
    description: "Log expenses in 5 different cities",
    icon: "🗺️",
    color: "from-teal-400 to-cyan-500",
    unlocked: false,
    progress: 1,
    maxProgress: 5,
    category: "Special"
  },
  {
    id: 21,
    title: "Perfectionist",
    description: "Review and edit 25 transactions",
    icon: "✨",
    color: "from-pink-400 to-purple-500",
    unlocked: false,
    progress: 8,
    maxProgress: 25,
    category: "Special"
  },
];

export default function Achievements() {
  const { user, signOut } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const categories = ["All", ...new Set(achievementsData.map(a => a.category))];
  
  const filteredAchievements = selectedCategory === "All" 
    ? achievementsData 
    : achievementsData.filter(a => a.category === selectedCategory);

  const unlockedCount = achievementsData.filter(a => a.unlocked).length;
  const totalCount = achievementsData.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar user={user} onSignOut={signOut} />

      <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-slate-800">
            Achievements
          </h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">
                {unlockedCount}
              </div>
              <div className="text-sm font-medium text-slate-600">
                Achievements Unlocked
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-slate-700">
                {totalCount}
              </div>
              <div className="text-sm font-medium text-slate-600">
                Total Achievements
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">
                {completionPercentage}%
              </div>
              <div className="text-sm font-medium text-slate-600">
                Completion Rate
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-400 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  );
}
