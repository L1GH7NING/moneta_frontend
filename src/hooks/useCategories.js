import { useState, useEffect } from "react";
import api from "../api/axios.js";

const normalizeCategories = (cats) => {
  return cats.map((cat) => ({
    ...cat,
    subCategories: cat.subcategories
      ? normalizeCategories(cat.subcategories)
      : [],
  }));
};

const sortCategories = (cats) => {
  const sorted = [...cats].sort((a, b) => a.name.localeCompare(b.name));
  sorted.forEach((cat) => {
    if (cat.subCategories && cat.subCategories.length > 0) {
      cat.subCategories = sortCategories(cat.subCategories);
    }
  });
  return sorted;
};

const removeCategory = (cats, idToRemove) => {
  return cats
    .filter((c) => c.id !== idToRemove)
    .map((c) => ({
      ...c,
      subCategories: c.subCategories
        ? removeCategory(c.subCategories, idToRemove)
        : [],
    }));
};

export function useCategories(user, onCategoriesUpdate) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedParents, setExpandedParents] = useState({});

  const toggleExpand = (categoryId) => {
    setExpandedParents((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const fetchCategories = async () => {
    if (!user || !user.id) {
      setIsLoading(false);
      setError("User data is not available for fetching categories.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/categories`);
      let newCategories = response.data || [];

      newCategories = normalizeCategories(newCategories);
      newCategories = sortCategories(newCategories);

      setCategories(newCategories);
      onCategoriesUpdate(newCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      let errorMessage =
        "Failed to load categories. Please check server or log in.";
      if (err.response && err.response.status === 403) {
        errorMessage = "Access Forbidden (403). Check user permissions.";
      } else if (err.response) {
        errorMessage = `Request failed with status ${err.response.status}.`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!user || !user.id) return;

    const originalCategories = categories;
    const updatedCategories = removeCategory(originalCategories, categoryId);
    setCategories(updatedCategories);
    onCategoriesUpdate(updatedCategories);

    try {
      await api.delete(`/categories/${categoryId}`);
      console.log(`Category ID ${categoryId} deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setCategories(originalCategories);
      onCategoriesUpdate(originalCategories);
      alert(
        `Failed to delete category: ${
          error.response?.data?.message || error.message
        }.`
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
  categories,
  setCategories, // ← Added this line
  isLoading,
  error,
  expandedParents,
  toggleExpand,
  fetchCategories,
  deleteCategory,
};
}