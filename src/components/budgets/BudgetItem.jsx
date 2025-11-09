import { AlertCircle } from "lucide-react";
import ActionMenu from "./ActionMenu";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories";

const getCategoryIcon = (categoryName) => {
  const IconComponent =
    CATEGORY_ICONS[categoryName] || CATEGORY_ICONS["default"];
  return IconComponent;
};

const getCategoryColor = (categoryName) => {
  return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS["default"];
};

const BudgetInput = ({ id, value, onChange, isLoading, error }) => (
  <div className="w-24">
    <div className="relative w-full">
      <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">
        ₹
      </span>
      <input
        type="text"
        placeholder={isLoading ? "..." : "0"}
        className={`text-sm text-right text-gray-800 pl-4 pr-1 py-1 bg-transparent border-b ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-gray-300 focus:border-orange-500"
        } focus:outline-none focus:ring-0 transition-all duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed font-medium`}
        min="0"
        value={value || ""}
        onChange={(e) => onChange(id, e.target.value)}
        disabled={isLoading}
      />
    </div>
  </div>
);

const BudgetItem = ({
  category,
  handleDeleteCategory,
  handleClearBudgetClick, // Updated prop name
  openMenuId,
  setOpenMenuId,
  user,
  isLoading,
  budgetInputs,
  onBudgetChange,
  budgetErrors = {},
}) => {
  const CategoryIcon = getCategoryIcon(category.name);
  const categoryColor = getCategoryColor(category.name);
  const parentError = budgetErrors[category.id];

  return (
    <div
      className={`bg-white rounded-xl shadow-md border mb-2 border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300 ${
        category.isOptimistic ? "opacity-50 animate-pulse" : ""
      }`}
    >
      <div className={`p-4`}>
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: categoryColor }}
            >
              <CategoryIcon size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0 flex-grow">
              <span className="text-sm font-semibold text-gray-800 truncate">
                {category.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <BudgetInput
              id={category.id}
              value={budgetInputs[category.id]}
              onChange={onBudgetChange}
              isLoading={isLoading}
              error={budgetErrors[category.id] ? "Error" : null}
            />
            <ActionMenu
              category={category}
              handleDeleteCategory={handleDeleteCategory}
              handleClearBudgetClick={handleClearBudgetClick} // Pass down the new handler
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              isLoading={isLoading}
            />
          </div>
        </div>
        {parentError && (
          <div className="flex mt-2 ml-1 text-xs text-red-600">
            <div className="flex items-center gap-0.5 max-w-full">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span className="max-w-xs text-right">{parentError}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetItem;