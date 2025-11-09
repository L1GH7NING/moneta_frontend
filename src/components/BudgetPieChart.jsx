// src/components/BudgetPieChart.jsx
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart, Loader2 } from "lucide-react";
import api from "../api/axios.js";

// --- CATEGORY COLORS MAP ---
const CATEGORY_COLORS = {
  Food: "#F59E0B",
  "Food & Dining": "#F59E0B",
  Rent: "#EF4444",
  Utilities: "#3B82F6",
  Transportation: "#10B981",
  Healthcare: "#8B5CF6",
  Entertainment: "#EC4899",
  Shopping: "#06B6D4",
  Groceries: "#F97316",
  "Loans & EMI": "#6366F1",
  Insurance: "#14B8A6",
  Work: "#65A30D",
  Education: "#818CF8",
  Travel: "#A78BFA",
  Bills: "#3B82F6",
  Fitness: "#FB923C",
  "Personal Care": "#F472B6",
  Savings: "#34D399",
  Investments: "#34D399",
  Gifts: "#FBBF24",
  Donations: "#FBBF24",
  Pets: "#60A5FA",
  default: "#9CA3AF",
};

const getCategoryColor = (categoryName) => {
  return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS["default"];
};
// --- END CATEGORY COLORS MAP ---

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload[0].payload.totalBudget; // Access total from payload
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div className="bg-white px-3 py-1.5 rounded-lg shadow-xl border border-gray-100/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <p className="font-semibold text-sm text-gray-800">{data.name}</p>
        </div>
        <p className="text-xs text-gray-600 font-mono pl-4">
          ₹{data.value.toLocaleString()}{" "}
          <span className="text-gray-400">({percentage}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

const BudgetPieChart = ({ categories, refreshTrigger }) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const fetchBudgets = async () => {
    if (!categories || categories.length === 0) {
      setChartData([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get("/budgets/current-cycle");
      const budgets = response.data;

      const budgetMap = {};
      budgets.forEach((budget) => {
        budgetMap[budget.categoryId] = budget.amount;
      });

      // Create a single chart with all categories that have a budget
      const budgetChartData = categories
        .filter((cat) => budgetMap[cat.id] > 0)
        .map((cat) => ({
          name: cat.name,
          value: budgetMap[cat.id] || 0,
          id: cat.id,
          color: getCategoryColor(cat.name),
        }));

      setChartData(budgetChartData);
    } catch (error) {
      console.error("Failed to fetch budgets for chart:", error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitiallyLoaded && categories.length > 0) {
      fetchBudgets();
      setHasInitiallyLoaded(true);
    }
  }, [categories.length, hasInitiallyLoaded]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchBudgets();
    }
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
        <p className="mt-4 text-gray-600">Loading budget data...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <BarChart className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-gray-600 text-center">
          No budget data available.
          <br />
          <span className="text-sm">
            Add budgets to your categories to see the breakdown.
          </span>
        </p>
      </div>
    );
  }

  const totalBudget = chartData.reduce((sum, item) => sum + item.value, 0);

  // Add totalBudget to each data entry for tooltip access
  const dataForChart = chartData.map((d) => ({ ...d, totalBudget }));

  return (
    <div className="flex flex-col items-center w-full h-full justify-between">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 w-full text-center">
        Budget Breakdown
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataForChart}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ cx, cy, midAngle, outerRadius, value }) => {
              const percent = (value / totalBudget) * 100;
              if (percent < 5) return null; // Hide small labels

              const radius = outerRadius * 1.25;
              const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
              const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

              return (
                <text
                  x={x}
                  y={y}
                  fill="#4B5563"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  className="text-[11px] font-medium"
                >
                  {`${percent.toFixed(0)}%`}
                </text>
              );
            }}
            outerRadius={200}
            innerRadius={120}
            fill="#8884d8"
            dataKey="value"
            stroke="none"
          >
            {dataForChart.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-6 w-full">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{totalBudget.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-center w-full">
          <div className="grid grid-cols-4 max-w-lg gap-x-6 gap-y-3">
            {chartData.map((item) => (
              <div key={item.id} className="flex items-start space-x-2">
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 font-medium">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    ₹{item.value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPieChart;
