// src/constants/categories.js
import {
  Wallet,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  Heart,
  Briefcase,
  GraduationCap,
  Plane,
  TrendingUp,
  Gift,
  Zap,
  Dumbbell,
  ShoppingCart,
  PawPrint,
  Repeat,
  Shield,
  Key,
  FileText, // New
  PiggyBank, // New
  HeartHandshake, // New
  Sparkles, // New
  Ticket, // New
} from "lucide-react";

// Category Colors Map
export const CATEGORY_COLORS = {
  // Financial
  Rent: "#EF4444", // red-500
  "Loans & EMI": "#6366F1", // indigo-500
  Bills: "#0EA5E9", // sky-500 (New)
  Insurance: "#14B8A6", // teal-500
  Savings: "#84CC16", // lime-500 (New)
  Investments: "#16A34A", // green-600 (New)

  // Daily Living
  "Food & Dining": "#F59E0B", // amber-500
  Groceries: "#F97316", // orange-500
  Utilities: "#3B82F6", // blue-500
  Transportation: "#10B981", // emerald-500
  Housing: "#78716c", // stone-500 (New)

  // Personal
  Healthcare: "#8B5CF6", // violet-500
  "Personal Care": "#F472B6", // pink-500
  Fitness: "#FB923C", // orange-400
  Education: "#818CF8", // indigo-300
  Shopping: "#06B6D4", // cyan-500

  // Lifestyle
  Entertainment: "#EC4899", // pink-500
  Travel: "#A78BFA", // violet-400
  Pets: "#60A5FA", // blue-400

  // Other
  Work: "#65A30D", // lime-600
  Gifts: "#FBBF24", // amber-400
  Donations: "#A855F7", // purple-500 (New)
  
  // Aliases for consistency
  Food: "#F59E0B",
  Transport: "#10B981",

  // Default
  default: "#9CA3AF", // gray-400
};

// Category Icons Map
export const CATEGORY_ICONS = {
  // Financial
  Rent: Key,
  "Loans & EMI": Repeat,
  Bills: FileText, // New
  Insurance: Shield,
  Savings: PiggyBank, // New
  Investments: TrendingUp,

  // Daily Living
  "Food & Dining": Utensils,
  Groceries: ShoppingCart,
  Utilities: Zap,
  Transportation: Car,
  Housing: Home,

  // Personal
  Healthcare: Heart,
  "Personal Care": Sparkles, // New
  Fitness: Dumbbell,
  Education: GraduationCap,
  Shopping: ShoppingBag,
  
  // Lifestyle
  Entertainment: Ticket, // New
  Travel: Plane,
  Pets: PawPrint,

  // Other
  Work: Briefcase,
  Gifts: Gift,
  Donations: HeartHandshake, // New

  // Aliases for consistency
  Food: Utensils,
  Transport: Car,
  
  // Default
  default: Wallet,
};

export const RECOMMENDED_CATEGORIES = [
  "Rent",
  "Loans & EMI",
  "Bills",
  "Insurance",
  "Savings",
  "Investments",
  "Food & Dining",
  "Groceries",
  "Utilities",
  "Transportation",
  "Housing",
  "Healthcare",
  "Personal Care",
  "Fitness",
  "Education",
  "Shopping",
  "Entertainment",
  "Travel",
  "Pets",
  "Work",
  "Gifts",
  "Donations",
];