import React, { useState, useEffect } from "react";
import api from '../api/axios.js';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories.js';

const RecentExpensesWidget = () => {
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      try {
        setIsLoadingExpenses(true);
        const response = await api.get('/expenses', {
          params: {
            page: 0,
            size: 5
          }
        });
        // API returns array directly
        const expenses = Array.isArray(response.data) ? response.data : [];
        setRecentExpenses(expenses.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent expenses:', error);
        setRecentExpenses([]);
      } finally {
        setIsLoadingExpenses(false);
      }
    };

    fetchRecentExpenses();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getCategoryColor = (categoryName) => {
    return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.default;
  };

  const getCategoryIcon = (categoryName) => {
    const IconComponent = CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
    return IconComponent;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Recent Activity
      </h2>
      
      {isLoadingExpenses ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : recentExpenses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No expenses yet</p>
      ) : (
        <div className="space-y-3">
          {recentExpenses.map((expense) => {
            const CategoryIcon = getCategoryIcon(expense.categoryName);
            const categoryColor = getCategoryColor(expense.categoryName);
            
            return (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${categoryColor}20` }}
                  >
                    <CategoryIcon 
                      size={20} 
                      style={{ color: categoryColor }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-800 truncate">{expense.description}</p>
                      <span 
                        className="px-2 py-0.5 text-xs rounded-full whitespace-nowrap flex-shrink-0"
                        style={{ 
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor
                        }}
                      >
                        {expense.categoryName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(expense.expenseDate)}</p>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <p className="font-semibold text-gray-900 whitespace-nowrap">{formatAmount(expense.amount)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentExpensesWidget;