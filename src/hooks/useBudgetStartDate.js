import { useState, useEffect } from "react";
import api from "../api/axios.js";

export function useBudgetStartDate(user, onUserUpdate) {
  const [userBudgetDay, setUserBudgetDay] = useState(user?.budgetStartDate);
  const [budgetStartDate, setBudgetStartDate] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  const calculateBudgetStartDate = (preferredDay, currentDate = new Date()) => {
    if (!preferredDay) return null;

    let targetDate = new Date(currentDate);
    const currentDay = currentDate.getDate();

    if (currentDay < preferredDay) {
      targetDate.setMonth(targetDate.getMonth() - 1);
    }

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const calculatedDay = Math.min(preferredDay, daysInMonth);
    targetDate.setDate(calculatedDay);

    return targetDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleChangeStartDate = async () => {
    if (!user || !user.id) return;

    const newDayStr = prompt(
      `Enter the new day of the month (1-31) for your budget cycle. Current day: ${
        userBudgetDay || 1
      }`
    );

    if (!newDayStr) return;

    const newDay = parseInt(newDayStr, 10);

    if (isNaN(newDay) || newDay < 1 || newDay > 31) {
      alert("Invalid day entered. Please enter a number between 1 and 31.");
      return;
    }

    try {
      const response = await api.patch(`/users/${user.id}`, {
        budgetStartDate: newDay,
      });

      const calculatedDateString = calculateBudgetStartDate(newDay);
      setBudgetStartDate(calculatedDateString);
      setUserBudgetDay(newDay);

      if (onUserUpdate) {
        onUserUpdate(response.data);
      }

      console.log("Budget Start Date updated successfully!");
    } catch (err) {
      console.error("Failed to update budget start date:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update date.";
      alert(`Error: ${errorMessage}`);
    }
  };

  useEffect(() => {
    if (user && user.budgetStartDate) {
      setUserBudgetDay(user.budgetStartDate);
      const calculatedDateString = calculateBudgetStartDate(
        user.budgetStartDate
      );
      if (calculatedDateString) {
        setBudgetStartDate(calculatedDateString);
      }
    }
  }, [user]);

  return {
    budgetStartDate,
    userBudgetDay,
    handleChangeStartDate,
  };
}