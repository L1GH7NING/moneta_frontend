import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import api from "../api/axios.js";
import CategoryItem from "./CategoryItem";
import ConfirmationModal from "./ConfirmationModal.jsx";
import { useBudgetStartDate } from "../hooks/useBudgetStartDate";
import { useCategories } from "../hooks/useCategories";
import { CategoryListHeader } from "./CategoryListHeader";

const CategoryList = forwardRef(
  (
    {
      user,
      isAdding,
      setIsAdding,
      onCategoriesUpdate,
      onUserUpdate,
      onBudgetUpdate,
    },
    ref
  ) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [budgetInputs, setBudgetInputs] = useState({});
    const [budgetErrors, setBudgetErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingBudgets, setIsFetchingBudgets] = useState(false);

    const { budgetStartDate, userBudgetDay, handleChangeStartDate } =
      useBudgetStartDate(user, onUserUpdate);

    const {
      categories,
      isLoading,
      error,
      fetchCategories,
      deleteCategory,
    } = useCategories(user, onCategoriesUpdate);

    const handleBudgetInputChange = (id, value) => {
      const numericValue = value === "" ? null : parseFloat(value);
      
      if (value !== "" && isNaN(numericValue)) {
        return; // Ignore invalid input
      }

      setBudgetInputs({
        ...budgetInputs,
        [id]: numericValue,
      });
    };

    // Fetch existing budgets for the current cycle
    const fetchCurrentBudgets = async () => {
      if (!user || !user.id) return;
      
      setIsFetchingBudgets(true);
      try {
        const response = await api.get('/budgets/current-cycle');
        const budgets = response.data;
        
        // Transform budgets array into an object keyed by categoryId
        const budgetMap = {};
        budgets.forEach(budget => {
          budgetMap[budget.categoryId] = budget.amount;
        });
        
        setBudgetInputs(budgetMap);
      } catch (error) {
        console.error('Failed to fetch current budgets:', error);
      } finally {
        setIsFetchingBudgets(false);
      }
    };

    // Fetch budgets when categories are loaded
    useEffect(() => {
      if (categories.length > 0 && !isFetchingBudgets) {
        fetchCurrentBudgets();
      }
    }, [categories.length]);

    useImperativeHandle(ref, () => ({
      refetch: fetchCategories,
    }));

    const handleDeleteCategoryClick = (categoryId, categoryName) => {
      setCategoryToDelete({ id: categoryId, name: categoryName });
      setIsDeleteModalOpen(true);
    };

    const handleSubmitBudgets = async () => {
        setIsSubmitting(true);
        
        const budgetsToSubmit = Object.entries(budgetInputs)
            .filter(([, amount]) => amount && amount > 0 && !isNaN(amount))
            .map(([categoryId, amount]) => ({
                categoryId: parseInt(categoryId, 10), 
                amount: amount
            }));
            
        if (budgetsToSubmit.length === 0) {
            alert("Please enter at least one budget amount.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await api.post('/budgets/batch', budgetsToSubmit);
            
            console.log("Budgets Saved Successfully:", response.data);
            alert("Budgets saved successfully!");
            
            await fetchCurrentBudgets();
            
            if (onBudgetUpdate) {
              onBudgetUpdate();
            }
            
        } catch (error) {
            console.error('Failed to submit budgets:', error);
            const errorMessage = error.response?.data?.message || "Failed to save budgets. Please try again.";
            alert(`Budget Save Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
      if (!categoryToDelete) return;
      await deleteCategory(categoryToDelete.id);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    };

    useEffect(() => {
      const handleDocumentClick = () => setOpenMenuId(null);
      if (openMenuId !== null) {
        document.addEventListener("click", handleDocumentClick);
      }
      return () => document.removeEventListener("click", handleDocumentClick);
    }, [openMenuId]);

    useEffect(() => {
      if (isAdding) setOpenMenuId(null);
    }, [isAdding]);

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
        <CategoryListHeader
          user={user}
          isLoading={isLoading}
          isAdding={isAdding}
          error={error}
          categories={categories}
          budgetStartDate={budgetStartDate}
          onAddCategory={() => setIsAdding(true)}
          onChangeStartDate={handleChangeStartDate}
        />

        {isLoading && (
          <p className="text-gray-500 py-4">Loading categories...</p>
        )}
        {error && <p className="text-red-600">**Error:** {error}</p>}

        {!isLoading && !error && categories.length === 0 ? (
          <p className="text-gray-500 italic py-4">
            No categories found. Click the + icon above to start!
          </p>
        ) : (
          <ul className="mb-6">
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                handleDeleteCategory={handleDeleteCategoryClick}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                user={user}
                isLoading={isLoading}
                budgetInputs={budgetInputs}
                onBudgetChange={handleBudgetInputChange}
                isFetchingBudgets={isFetchingBudgets}
                budgetErrors={budgetErrors}
              />
            ))}
          </ul>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <div className="pt-4 border-t border-gray-200 mt-auto">
            <button
              onClick={handleSubmitBudgets}
              disabled={isSubmitting || isFetchingBudgets}
              className={`w-full text-white font-semibold py-3 rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isSubmitting || isFetchingBudgets
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isSubmitting ? 'Saving...' : isFetchingBudgets ? 'Loading...' : 'Save Monthly Budget'}
            </button>
          </div>
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Confirm Category Deletion"
          message={`Are you sure you want to delete the category: "${
            categoryToDelete ? categoryToDelete.name : ""
          }"? All associated budget entries may also be deleted.`}
          confirmButtonText="Delete Category"
          confirmButtonColor="bg-red-600 hover:bg-red-700"
        />
      </div>
    );
  }
);

export default CategoryList;