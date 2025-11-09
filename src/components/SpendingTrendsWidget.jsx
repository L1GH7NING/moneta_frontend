import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios.js';

const SpendingTrendsWidget = () => {
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6'); // 6 or 12 months

  useEffect(() => {
    const fetchSpendingTrends = async () => {
      try {
        setIsLoading(true);
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(timeRange));
        
        // Fetch all expenses in the date range by requesting a large page size
        const response = await api.get('/expenses', {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            page: 0, // Fetch the first page
            size: 1000 // Set a large size to get all expenses in the range
          }
        });
        
        // The backend response is the list of expenses directly, not a page object
        const expenses = Array.isArray(response.data) ? response.data : [];
        
        // Group expenses by month
        const monthlyData = {};
        expenses.forEach(expense => {
          const date = new Date(expense.expenseDate);
          // Using a consistent UTC-based key to avoid timezone issues
          const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthLabel,
              total: 0,
              sortKey: monthKey
            };
          }
          monthlyData[monthKey].total += parseFloat(expense.amount);
        });
        
        // Convert to array and sort by date
        const sortedData = Object.values(monthlyData)
          .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
          .map(item => ({
            month: item.month,
            amount: Math.round(item.total * 100) / 100
          }));
        
        setTrendData(sortedData);
      } catch (error) {
        console.error('Error fetching spending trends:', error);
        setTrendData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpendingTrends();
  }, [timeRange]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800">{payload[0].payload.month}</p>
          <p className="text-sm font-semibold text-orange-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const totalSpending = trendData.reduce((sum, item) => sum + item.amount, 0);
  const avgMonthly = trendData.length > 0 ? totalSpending / trendData.length : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Spending Trends</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('6')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === '6'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            6M
          </button>
          <button
            onClick={() => setTimeRange('12')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === '12'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            12M
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : trendData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No spending data available for this period</p>
        </div>
      ) : (
        <>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#F97316" 
                  strokeWidth={3}
                  dot={{ fill: '#F97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Total Spending</p>
              <p className="text-lg font-semibold text-gray-800">{formatCurrency(totalSpending)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Average</p>
              <p className="text-lg font-semibold text-gray-800">{formatCurrency(avgMonthly)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpendingTrendsWidget;