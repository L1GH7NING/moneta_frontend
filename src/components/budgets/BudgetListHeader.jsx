import { Plus } from "lucide-react";

export function BudgetListHeader({
  user,
  isLoading,
  isAdding,
  error,
  categories,
  budgetStartDate,
  onAddCategory,
  onChangeStartDate,
}) {
  return (
    <div className="mb-6 border-b pb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-semibold text-gray-800">
          Category wise budget
        </h2>
        <button
          onClick={onAddCategory}
          disabled={!user || isLoading || isAdding}
          title="Add New Category"
          className="flex items-center justify-center bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition duration-200 ease-in-out shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {!isLoading && !error && categories.length > 0 && (
        <div className="flex items-center justify-between space-x-4 mt-6">
          <p className="text-gray-600 text-sm">
            Budget Starts:{" "}
            <span className="font-semibold text-orange-600">
              {budgetStartDate}
            </span>
          </p>
          <p
            onClick={onChangeStartDate}
            className="text-sm text-orange-600 bg-transparent hover:text-orange-700 hover:underline transition duration-150 focus:outline-none focus:ring-0 cursor-pointer"
          >
            Change date
          </p>
        </div>
      )}
    </div>
  );
}