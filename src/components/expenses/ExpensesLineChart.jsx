import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, CartesianGrid } from 'recharts';
import { Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedDate = new Date(label + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    return (
      <div className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg">
        <p className="text-sm font-medium text-gray-500">{formattedDate}</p>
        <p className="text-lg font-bold text-orange-500">{`₹${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const ExpensesLineChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[380px]">
        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 h-[380px] flex justify-center items-center">
        <p className="text-gray-500">No spending data for this period.</p>
      </div>
    );
  }
  
  // Data processing logic remains the same.
  const sampleDate = new Date(data[0].date + 'T00:00:00');
  const year = sampleDate.getFullYear();
  const month = sampleDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const expenseMap = new Map(data.map(item => [item.date, item.total]));

  const processedData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      date: dateStr,
      total: expenseMap.get(dateStr) || 0,
    };
  });
  
  const formatXAxisTick = (dateStr) => dateStr.split('-')[2];

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-xl border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Monthly Spending
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            {/* The gradient is now more vibrant at the top and fades out smoothly. */}
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />

          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisTick} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            axisLine={false}
            tickLine={false} 
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            axisLine={true}
            tickLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' }} 
          />

          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="none" 
            fill="url(#colorTotal)" 
          />
          
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#f97316"
            strokeWidth={2.5} 
            dot={false}
            activeDot={{ r: 7, stroke: '#fff', strokeWidth: 3, fill: '#f97316' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensesLineChart;