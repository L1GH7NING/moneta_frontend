import React, { useState, useEffect } from "react";
import api from '../../api/axios.js';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/categories.js';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider.jsx';

const TopCategoriesWidget = ({ limit = 5 }) => {
  const { user } = useAuth();
  const [topCategories, setTopCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'month' or 'all'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        setIsLoading(true);
        
        let startDate = null;
        let endDate = null;
        
        if (timeRange === 'month' && user?.budgetStartDate) {
          const now = new Date();
          const budgetDay = user.budgetStartDate;

          let budgetStartDate = new Date(now.getFullYear(), now.getMonth(), budgetDay);

          // If today's date is before the budget day, the cycle started last month
          if (now.getDate() < budgetDay) {
            budgetStartDate.setMonth(budgetStartDate.getMonth() - 1);
          }

          // End date is one day before the start of the next cycle
          let budgetEndDate = new Date(budgetStartDate);
          budgetEndDate.setMonth(budgetEndDate.getMonth() + 1);
          budgetEndDate.setDate(budgetEndDate.getDate() - 1);

          startDate = budgetStartDate.toISOString().split('T')[0];
          endDate = budgetEndDate.toISOString().split('T')[0];
        }
        
        // Fetch category totals using the API
        const params = {};
        if (startDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        
        const response = await api.get('/expenses/total/category', { params });
        const categoryTotals = Array.isArray(response.data) ? response.data : [];
        
        // Create a map of fixed category names for quick lookup
        const fixedCategoryNames = new Set(
          categories.filter(cat => cat.fixed).map(cat => cat.name)
        );
        
        // Filter out fixed categories
        const variableCategoryTotals = categoryTotals.filter(
          item => !fixedCategoryNames.has(item.category)
        );
        
        // Sort by total and get top N
        const sortedCategories = variableCategoryTotals
          .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
          .slice(0, limit);
        
        // Calculate total for percentage
        const totalSpending = sortedCategories.reduce(
          (sum, cat) => sum + parseFloat(cat.total), 0
        );
        
        // Add percentage and count (we don't have count from this API, so we'll omit it)
        const categoriesWithPercentage = sortedCategories.map(cat => ({
          name: cat.category,
          total: parseFloat(cat.total),
          percentage: totalSpending > 0 ? (parseFloat(cat.total) / totalSpending) * 100 : 0
        }));
        
        setTopCategories(categoriesWithPercentage);
      } catch (error) {
        console.error('Error fetching top categories:', error);
        setTopCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (categories.length > 0 || timeRange === 'all') {
      fetchTopCategories();
    }
  }, [limit, timeRange, user, categories]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-800">Top Spending Categories</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === 'month'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : topCategories.length === 0 ? (
        <div className="flex justify-center items-center flex-1">
          <p className="text-gray-500">No spending data available</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col justify-around">
          {topCategories.map((category, index) => {
            const CategoryIcon = getCategoryIcon(category.name);
            const categoryColor = getCategoryColor(category.name);

            return (
              <div key={category.name} className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg font-bold text-gray-400 w-6">
                      {index + 1}
                    </span>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${categoryColor}20` }}
                    >
                      <CategoryIcon size={20} style={{ color: categoryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {category.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(category.total)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: categoryColor
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopCategoriesWidget;