// src/pages/Budget.jsx
import React, { useState, useRef } from "react"; 
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";
import CategoryList from "../components/CategoryList.jsx";
import AddCategoryModal from "../components/AddCategoryModal.jsx";
import BudgetPieChart from "../components/BudgetPieChart.jsx";

const Budget = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // STATE
  const [categories, setCategories] = useState([]); 
  const [isAdding, setIsAdding] = useState(false); 
  const [budgetRefreshTrigger, setBudgetRefreshTrigger] = useState(0);

  const categoryListRef = useRef(null);

  const handleCategoriesUpdate = (newCategories) => {
    setCategories(newCategories);
  };

  const handleBudgetUpdate = () => {
    setBudgetRefreshTrigger(prev => prev + 1);
  };
  
  const handleModalSuccess = () => {
      setIsAdding(false);
      
      if (categoryListRef.current && categoryListRef.current.refetch) {
          categoryListRef.current.refetch(); 
      }
  };

  const handleUserUpdate = (updatedUserData) => {
      if (setUser) {
          setUser(updatedUserData); 
      }
  };

  return (
    <div className="bg-gray-50 px-24 py-4 min-h-screen w-screen flex font-alan">
      <Sidebar />

      <main className="flex-1 p-6 pb-16">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Budget Planner
            </h1>
            <p className="text-gray-600 mt-1">Add and manage your spending categories</p>
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2 flex flex-col items-center">
            <BudgetPieChart categories={categories} refreshTrigger={budgetRefreshTrigger} />
          </div>

          <CategoryList 
            ref={categoryListRef} 
            user={user}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            onCategoriesUpdate={handleCategoriesUpdate} 
            onUserUpdate={handleUserUpdate}
            onBudgetUpdate={handleBudgetUpdate}
          />
        </div>
      </main>

      <AddCategoryModal 
        user={user}
        isOpen={isAdding}
        onClose={() => setIsAdding(false)} 
        onSuccess={handleModalSuccess} 
        existingCategories={categories}
      />
    </div>
  );
};

export default Budget;