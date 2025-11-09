// src/hooks/useBudgetData.js
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const useBudgetData = (user) => {
  const [data, setData] = useState({ categories: [], budgets: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const [categoriesResponse, budgetsResponse] = await Promise.all([
        api.get("/categories"),
        api.get("/budgets/current-cycle"),
      ]);
      const budgetMap = {};
      budgetsResponse.data.forEach((budget) => {
        budgetMap[budget.categoryId] = budget; // Assuming budget object has a nested category object
      });

      setData({
        categories: categoriesResponse.data,
        budgets: budgetMap,
      });
    } catch (err) {
      console.error("Failed to fetch budget data:", err);
      setError("Could not load budget data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};
