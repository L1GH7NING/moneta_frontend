// src/pages/Budget.jsx
import React, { useState } from "react";
import Sidebar from "../components/utils/Sidebar.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import BudgetList from "../components/budgets/BudgetList.jsx";
import AddCategoryModal from "../components/utils/AddCategoryModal.jsx";
import BudgetPieChart from "../components/budgets/BudgetPieChart.jsx";
import { useBudgetData } from "../hooks/useBudgetData.js";
import { Loader2 } from "lucide-react";

const Budget = () => {
  const { user, setUser } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const { data, isLoading, error, refetch } = useBudgetData(user);

  const handleModalSuccess = () => {
    setIsAdding(false);
    refetch();
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
            <h1 className="text-3xl font-bold text-gray-800">Budget Planner</h1>
            <p className="text-gray-600 mt-1">
              Add and manage your spending categories
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2 flex flex-col items-center min-h-[36rem]">
              <BudgetPieChart
                categories={data.categories}
                budgets={data.budgets}
              />
            </div>

            <BudgetList
              user={user}
              isAdding={isAdding}
              setIsAdding={setIsAdding}
              categories={data.categories}
              initialBudgets={data.budgets}
              onUserUpdate={handleUserUpdate}
              onUpdate={refetch}
            />
          </div>
        )}
      </main>

      <AddCategoryModal
        user={user}
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onSuccess={handleModalSuccess}
        existingCategories={data.categories}
      />
    </div>
  );
};

export default Budget;