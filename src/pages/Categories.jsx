import React, { useState, useEffect } from "react";
import Sidebar from "../components/utils/Sidebar.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { Plus } from "lucide-react";
import api from '../api/axios.js';
import CategoryCard from "../components/categories/CategoryCard.jsx";
import AddCategoryModal from "../components/utils/AddCategoryModal.jsx";
import ConfirmationModal from "../components/utils/ConfirmationModal.jsx";

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        const startDate = '1970-01-01';
        const endDate = new Date().toISOString().split('T')[0];

        const [categoriesResponse, totalsResponse] = await Promise.all([
          api.get('/categories'),
          api.get('/expenses/total/category', { params: { startDate, endDate } })
        ]);

        const allCategories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
        const categoryTotals = Array.isArray(totalsResponse.data) ? totalsResponse.data : [];
        
        // --- FIX START ---
        // Create the map using the category NAME as the key, since that's what the totals API returns.
        const totalsMap = new Map(categoryTotals.map(item => [item.category, item.total]));
        // --- FIX END ---

        const recentExpensePromises = allCategories.map(category =>
          api.get('/expenses', {
            params: {
              categoryId: category.id,
              size: 1,
              sortBy: 'expenseDate',
              sortDir: 'desc'
            }
          }).then(res => ({
            categoryId: category.id,
            recentExpense: res.data.length > 0 ? res.data[0] : null
          }))
        );

        const recentExpensesResults = await Promise.all(recentExpensePromises);
        const recentExpenseMap = new Map(recentExpensesResults.map(item => [item.categoryId, item.recentExpense]));

        const combinedData = allCategories.map(category => ({
          ...category,
          // --- FIX START ---
          // Look up the total using the category NAME from the main category object.
          totalSpent: totalsMap.get(category.name) || 0,
          // --- FIX END ---
          recentExpense: recentExpenseMap.get(category.id) || null
        }));

        setCategories(combinedData);

      } catch (error) {
        console.error('Error fetching category data:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [user, refreshTrigger]);

  const handleToggleFixed = async (categoryId, categoryName, newFixedStatus) => {
    try {
      await api.put(`/categories/${categoryId}`, { name: categoryName, fixed: newFixedStatus });
      setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, fixed: newFixedStatus } : cat));
    } catch (error) {
      console.error('Error toggling fixed category:', error);
      alert('Failed to update category.');
    }
  };

  const handleDeleteRequest = (categoryId) => {
    setCategoryToDelete(categoryId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/categories/${categoryToDelete}`);
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. It might have associated expenses.');
    } finally {
      setCategoryToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleAddCategorySuccess = () => {
    setIsAddModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-gray-50 px-24 py-4 min-h-screen w-screen flex font-alan">
      <Sidebar />
      <main className="flex-1 p-6 pb-16">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
            <p className="text-gray-600 mt-1">Manage your expense categories</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
          >
            <Plus size={20} />
            Add Category
          </button>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No categories found</p>
            <button onClick={() => setIsAddModalOpen(true)} className="mt-4 text-orange-500 hover:text-orange-600">
              Create your first category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onToggleFixed={handleToggleFixed}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </main>

      <AddCategoryModal
        user={user}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddCategorySuccess}
        existingCategories={categories}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this category? All associated expenses will also be affected. This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default Categories;