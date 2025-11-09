import { useState, useEffect } from "react";
import Sidebar from "../components/utils/Sidebar.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import ExpensesLineChart from "../components/expenses/ExpensesLineChart.jsx";
import ExpensesPieChart from "../components/expenses/ExpensesPieChart.jsx";
import AddExpenseWidget from "../components/expenses/AddExpenseWidget.jsx";
import ExpenseSummaryCards from "../components/expenses/ExpenseSummaryCards.jsx";
import api from "../api/axios.js";

const Expenses = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [budgets, setBudgets] = useState([]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      // Wait for user and budgetStartDate to be available
      if (!user || typeof user.budgetStartDate === 'undefined') return;
      
      setIsLoading(true);
      try {
        // --- Calculate budget cycle dates based on user's budgetStartDate ---
        const now = new Date();
        const budgetDay = user.budgetStartDate;

        let startDate = new Date(now.getFullYear(), now.getMonth(), budgetDay);

        // If today's date is before the budget day, the cycle started last month
        if (now.getDate() < budgetDay) {
          startDate.setMonth(startDate.getMonth() - 1);
        }

        // End date is one day before the start of the next cycle
        let endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);

        const startDateString = startDate.toISOString().split('T')[0];
        const endDateString = endDate.toISOString().split('T')[0];
        // --- End of date calculation ---

        const [catExpensesRes, totalRes, budgetsRes, categoriesRes, dailyRes] = await Promise.all([
          api.get(`/expenses/total/category?startDate=${startDateString}&endDate=${endDateString}`),
          api.get(`/expenses/total?startDate=${startDateString}&endDate=${endDateString}`),
          api.get("/budgets/current-cycle"),
          api.get("/categories"),
          api.get(`/expenses/total/daily?startDate=${startDateString}&endDate=${endDateString}`)
        ]);

        setCategoryExpenses(catExpensesRes.data || []);
        setMonthlyTotal(totalRes.data || 0);
        setBudgets(budgetsRes.data || []);
        setCategories(categoriesRes.data || []);
        setDailyExpenses(dailyRes.data || []);

      } catch (error) {
        console.error("Failed to fetch expense page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [user, refreshTrigger]);

  const handleExpenseAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
   <div className="bg-gray-50 px-24 py-4 min-h-screen w-screen flex font-alan">
      <Sidebar />
      <main className="flex-1 p-6 pb-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
          <p className="text-gray-600 mt-1">Track and manage your monthly expenses</p>
        </header>

        <AddExpenseWidget
          user={user}
          categories={categories}
          onExpenseAdded={handleExpenseAdded}
          refreshTrigger={refreshTrigger}
        />

        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="col-span-1">
            <ExpenseSummaryCards 
              monthlyTotal={monthlyTotal}
              budgets={budgets}
              categoryExpensesData={categoryExpenses}
              loading={isLoading}
            />
          </div>
          <div className="col-span-2">
            <ExpensesPieChart
              data={categoryExpenses}
              loading={isLoading}
            />
          </div>
        </div>
        <div className="mt-8">
          <ExpensesLineChart
            data={dailyExpenses}
            loading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default Expenses;