import React, { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories.js";
import { Link } from "react-router-dom";

const CategoryCard = ({ category, onToggleFixed, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const CategoryIcon = CATEGORY_ICONS[category.name] || CATEGORY_ICONS.default;
  const categoryColor =
    CATEGORY_COLORS[category.name] || CATEGORY_COLORS.default;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No expenses yet";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const newFixedStatus = !category.fixed;
      await onToggleFixed(category.id, category.name, newFixedStatus);
    } catch (error) {
      console.error("Error toggling fixed status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(category.id);
      // If successful, the component will unmount, so no need to reset state.
    } catch (error) {
      console.error("Failed to delete category:", error);
      // If deletion fails, reset the state to allow another attempt.
      setIsDeleting(false);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
      <div className="flex-grow">
        {/* Category Icon and Name */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            <CategoryIcon size={28} style={{ color: categoryColor }} />
          </div>
          <div className="flex-1">
          <Link to={`/categories/${category.id}`}>
            <h3 className="text-xl font-semibold text-gray-800 hover:text-orange-500 transition-colors">
              {category.name}
            </h3>
            </Link>
            {category.fixed && (
              <span className="text-xs text-orange-600 font-medium">
                Fixed Expense
              </span>
            )}
          </div>
        </div>

        {/* Total Spent */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(category.totalSpent)}
          </p>
        </div>

        {/* Recent Expense */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Recent Expense</p>
          {category.recentExpense ? (
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {category.recentExpense.description}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(category.recentExpense.expenseDate)}
                </p>
              </div>
              <p className="font-semibold text-gray-800 ml-2">
                {formatCurrency(category.recentExpense.amount)}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 italic">No expenses yet</p>
          )}
        </div>
      </div>


      {/* Actions Section */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        {/* Fixed Toggle with Label and Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Mark as Fixed
            </label>
            <div className="group relative">
              <Info
                size={16}
                className="text-gray-400 hover:text-gray-600 cursor-help"
              />

              {/* Tooltip */}
              <div className="absolute left-6 bottom-0 w-64 bg-gray-800 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                <div className="flex items-start gap-2">
                  <Info size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Fixed Category</p>
                    <p className="text-gray-300 text-xs">
                      Fixed categories are expenses that occur regularly every
                      month, like rent, bills, or subscriptions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={isUpdating || isDeleting}
            className={`relative w-14 h-7 rounded-full transition-colors flex items-center p-1 ${
              category.fixed ? "bg-orange-500" : "bg-gray-300"
            } ${isUpdating || isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                category.fixed ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        
        {/* Subtle Delete Button */}
        <div className="flex items-center justify-start mt-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="flex items-center px-6 py-2 rounded-lg bg-red-600 text-red-200 gap-1.5 text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;