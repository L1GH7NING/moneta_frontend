// src/components/ExpenseSummaryCards.jsx
import React, { useMemo } from "react";
// 1. Import the category colors constant
import { CATEGORY_COLORS } from "../constants/categories";

const ExpenseSummaryCards = ({ monthlyTotal, budgets, categoryExpensesData, loading }) => {

  const categoryExpensesMap = useMemo(() => {
    const map = {};
    if (Array.isArray(categoryExpensesData)) {
      categoryExpensesData.forEach(item => {
        map[item.category] = parseFloat(item.total);
      });
    }
    return map;
  }, [categoryExpensesData]);

  const formattedExpense = monthlyTotal.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Monthly Expenses Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">This Month</p>
            {loading ? (
              <h3 className="text-2xl font-bold text-gray-800 mt-1">Loading...</h3>
            ) : (
              <h3 className="text-2xl font-bold text-gray-800 mt-1">₹{formattedExpense}</h3>
            )}
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Budget Progress Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Budget Progress</h3>
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        {loading ? (
           <p className="text-gray-500 text-sm text-center py-4">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No budgets set for this month</p>
        ) : (
          <div className="space-y-4 overflow-y-auto">
            {budgets.map((budget) => {
              const categoryName = budget.categoryName; 
              if (!categoryName) return null;

              const spent = categoryExpensesMap[categoryName] || 0;
              const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
              const isOverBudget = percentage > 100;
              
              // 2. Determine the progress bar's color.
              // If over budget, use red. Otherwise, look up the category color.
              const barColor = isOverBudget
                ? CATEGORY_COLORS['Rent'] // Use a standard red for the "over budget" status
                : CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.default;

              return (
                <div key={budget.id || categoryName} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{categoryName}</span>
                    <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
                      ₹{spent.toLocaleString('en-IN')} / ₹{budget.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    {/* 3. Apply the dynamic color using an inline style */}
                    <div
                      className={`h-2.5 rounded-full transition-all`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: barColor,
                      }}
                    ></div>
                  </div>
                  {isOverBudget && <p className="text-xs text-red-600 text-right">Over budget!</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseSummaryCards;