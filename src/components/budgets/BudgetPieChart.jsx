import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORY_COLORS } from "../../constants/categories.js";

const getCategoryColor = (categoryName) => CATEGORY_COLORS[categoryName] || CATEGORY_COLORS["default"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload[0].payload.totalBudget;
    const percentage = ((data.value / total) * 100).toFixed(1);
    return (
      <div className="bg-white px-3 py-1.5 rounded-lg shadow-xl border border-gray-100/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}/>
          <p className="font-semibold text-sm text-gray-800">{data.name}</p>
        </div>
        <p className="text-xs text-gray-600 font-mono pl-4">
          ₹{data.value.toLocaleString()} <span className="text-gray-400">({percentage}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

const BudgetPieChart = ({ categories, budgets }) => {
  const chartData = useMemo(() => {
    if (!categories || categories.length === 0 || !budgets) {
      return [];
    }
    return categories
      .filter((cat) => !cat.fixed && budgets[cat.id] && budgets[cat.id].amount > 0)
      .map((cat) => ({
        name: cat.name,
        value: budgets[cat.id]?.amount || 0,
        id: cat.id,
        color: getCategoryColor(cat.name),
      }));
  }, [categories, budgets]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <BarChart className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-gray-600 text-center">
          No variable budget data available.
          <br />
          <span className="text-sm">
            Add budgets to your non-fixed categories to see the breakdown.
          </span>
        </p>
      </div>
    );
  }

  const totalBudget = chartData.reduce((sum, item) => sum + item.value, 0);
  const dataForChart = chartData.map((d) => ({ ...d, totalBudget }));

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex justify-center items-center gap-2 mb-6 border-b pb-3 w-full">
        <h2 className="text-2xl font-semibold text-gray-800">
          Budget Breakdown
        </h2>
        <div className="relative group flex items-center">
          <Info size={18} className="text-gray-400 hover:text-gray-600 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-800 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl">
            <div className="flex items-start gap-2.5">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">About This Chart</p>
                <p className="text-gray-300 text-xs">
                  This chart shows your budget for variable spending. Fixed expenses are excluded. You can manage which categories are fixed in your{" "}
                  <Link to="/settings" className="text-orange-400 hover:underline">
                    settings
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataForChart}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ cx, cy, midAngle, outerRadius, value }) => {
                const percent = (value / totalBudget) * 100;
                if (percent < 5) return null;
                const radius = outerRadius * 1.25;
                const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                return (
                  <text x={x} y={y} fill="#4B5563" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" className="text-[11px] font-medium">
                    {`${percent.toFixed(0)}%`}
                  </text>
                );
              }}
              outerRadius={"80%"}
              innerRadius={"50%"} 
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
      </div>
      
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