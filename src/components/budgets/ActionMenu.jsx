// src/components/ActionMenu.jsx
import React from "react";
import { MoreVertical, Trash2, Eraser } from "lucide-react";

const ActionMenu = ({
  category,
  handleDeleteCategory,
  handleClearBudgetClick, // Updated prop name
  openMenuId,
  setOpenMenuId,
  isLoading,
}) => {
  const isOpen = openMenuId === category.id;
  const isSubmitting = category.isOptimistic || isLoading;

  const baseItemClass =
    "block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors cursor-pointer flex items-center gap-2";
  const disabledClass = isSubmitting ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div className="relative">
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (!isSubmitting) {
            setOpenMenuId(isOpen ? null : category.id);
          }
        }}
        className={`text-gray-500 hover:text-gray-800 bg-transparent p-1 rounded-full cursor-pointer transition-colors ${
          isSubmitting ? "opacity-50" : ""
        }`}
      >
        <MoreVertical size={18} />
      </div>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          onMouseLeave={() => setOpenMenuId(null)}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isSubmitting) {
                // Pass both id and name to the handler
                handleClearBudgetClick(category.id, category.name);
                setOpenMenuId(null);
              }
            }}
            className={`${baseItemClass} text-blue-600 hover:bg-blue-50 ${disabledClass}`}
          >
            <Eraser size={14} className="flex-shrink-0" />
            <span>Clear Budget</span>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isSubmitting) {
                handleDeleteCategory(category.id, category.name);
                setOpenMenuId(null);
              }
            }}
            className={`${baseItemClass} text-red-600 hover:bg-red-50 ${disabledClass}`}
          >
            <Trash2 size={14} className="flex-shrink-0" />
            <span>Delete Category</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;