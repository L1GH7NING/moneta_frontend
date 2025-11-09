import React, { useState, useEffect } from "react";
import api from "../../api/axios.js";
import BudgetItem from "./BudgetItem.jsx";
import ConfirmationModal from "../utils/ConfirmationModal.jsx";
import { useBudgetStartDate } from "../../hooks/useBudgetStartDate.js";
import { BudgetListHeader } from "./BudgetListHeader.jsx";

const BudgetList = ({
  user,
  isAdding,
  setIsAdding,
  categories,
  initialBudgets,
  onUserUpdate,
  onUpdate,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [budgetInputs, setBudgetInputs] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- New state for the "Clear Budget" modal ---
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [budgetToClear, setBudgetToClear] = useState(null);

  useEffect(() => {
    const amountMap = {};
    if (initialBudgets) {
      for (const catId in initialBudgets) {
        amountMap[catId] = initialBudgets[catId].amount;
      }
    }
    setBudgetInputs(amountMap);
  }, [initialBudgets]);

  const { budgetStartDate, handleChangeStartDate } = useBudgetStartDate(
    user,
    onUserUpdate
  );

  const nonFixedCategories = categories.filter((category) => !category.fixed);

  const handleBudgetInputChange = (id, value) => {
    const numericValue = value === "" ? null : parseFloat(value);
    if (value !== "" && isNaN(numericValue)) {
      return;
    }
    setBudgetInputs({
      ...budgetInputs,
      [id]: numericValue,
    });
  };

  const handleClearBudgetClick = (categoryId, categoryName) => {
    setBudgetToClear({ id: categoryId, name: categoryName });
    setIsClearModalOpen(true);
  };

  const handleConfirmClear = async () => {
    if (!budgetToClear) return;
    const categoryId = budgetToClear.id;
    const budgetInfo = initialBudgets[categoryId];

    if (!budgetInfo || !budgetInfo.id) {
      console.error("No existing budget to delete.");
      setIsClearModalOpen(false);
      setBudgetToClear(null);
      return;
    }

    const budgetId = budgetInfo.id;
    try {
      await api.delete(`/budgets/${budgetId}`);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete budget:", error);
      alert("Failed to remove the budget. Please try again.");
    } finally {
      setIsClearModalOpen(false);
      setBudgetToClear(null);
    }
  };
  
  const handleDeleteCategoryClick = (categoryId, categoryName) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setIsDeleteModalOpen(true);
  };

  const handleSubmitBudgets = async () => {
    setIsSubmitting(true);
    const budgetsToSubmit = Object.entries(budgetInputs)
      .filter(([, amount]) => amount !== null && !isNaN(amount) && amount > 0)
      .map(([categoryId, amount]) => ({
        categoryId: parseInt(categoryId, 10),
        amount: amount,
      }));

    if (budgetsToSubmit.length === 0) {
      alert("Please enter at least one budget amount to save.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/budgets/batch", budgetsToSubmit);
      alert("Budgets saved successfully!");
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to submit budgets:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save budgets. Please try again.";
      alert(`Budget Save Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  useEffect(() => {
    const handleDocumentClick = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("click", handleDocumentClick);
    }
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [openMenuId]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
      <BudgetListHeader
        user={user}
        isAdding={isAdding}
        categories={categories}
        budgetStartDate={budgetStartDate}
        onAddCategory={() => setIsAdding(true)}
        onChangeStartDate={handleChangeStartDate}
      />

      {nonFixedCategories.length === 0 ? (
        <p className="text-gray-500 italic py-4">
          No categories available for budgeting. Fixed categories are managed separately.
        </p>
      ) : (
        <ul className="mb-6">
          {nonFixedCategories.map((category) => (
            <BudgetItem
              key={category.id}
              category={category}
              handleDeleteCategory={handleDeleteCategoryClick}
              handleClearBudgetClick={handleClearBudgetClick} // Pass the new click handler
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              user={user}
              budgetInputs={budgetInputs}
              onBudgetChange={handleBudgetInputChange}
            />
          ))}
        </ul>
      )}

      {nonFixedCategories.length > 0 && (
        <div className="pt-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleSubmitBudgets}
            disabled={isSubmitting}
            className={`w-full text-white font-semibold py-3 rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Monthly Budget"}
          </button>
        </div>
      )}

      {/* Modal for Deleting a Category */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Category Deletion"
        message={`Are you sure you want to delete the category: "${
          categoryToDelete?.name ?? ""
        }"? All associated budget entries will also be deleted.`}
        confirmButtonText="Delete Category"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />

      {/* --- New Modal for Clearing a Budget --- */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
        title="Confirm Clear Budget"
        message={`Are you sure you want to clear the budget for "${
          budgetToClear?.name ?? ""
        }"? This will delete this budget entry for the current cycle.`}
        confirmButtonText="Clear Budget"
        confirmButtonColor="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
};

export default BudgetList;