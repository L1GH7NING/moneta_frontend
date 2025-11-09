import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart, Loader2 } from "lucide-react";
import { CATEGORY_COLORS } from "../../constants/categories";

const CustomTooltip = ({ active, payload, chartData }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
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

const ExpensesPieChart = ({ data, loading }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.category,
      value: parseFloat(item.total),
      color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.default
    }));
  }, [data]);

  const MIN_CHART_HEIGHT = "min-h-[450px]"; // Define a minimum height constant

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${MIN_CHART_HEIGHT} bg-white rounded-lg shadow-lg p-6`}>
        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
        <p className="mt-4 text-gray-600">Loading expense data...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${MIN_CHART_HEIGHT} bg-white rounded-lg shadow-lg p-6`}>
        <BarChart className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-gray-600 text-center">
          No expenses recorded for this month.
          <br />
          <span className="text-sm">
            Add expenses to see the breakdown.
          </span>
        </p>
      </div>
    );
  }

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`flex flex-col items-center w-full h-full ${MIN_CHART_HEIGHT} bg-white rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between w-full mb-6 px-4">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 w-full text-center">
            Expense Breakdown
          </h2>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ cx, cy, midAngle, outerRadius, value }) => {
                const total = chartData.reduce((sum, item) => sum + item.value, 0);
                const percent = (value / total) * 100;
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
              outerRadius="80%"
              innerRadius="40%"
              fill="#8884d8"
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={(props) => <CustomTooltip {...props} chartData={chartData} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 w-full">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-4 max-w-lg gap-x-6 gap-y-3 mb-6">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 font-medium">{item.name}</p>
                  <p className="text-xs text-gray-600">₹{item.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPieChart;