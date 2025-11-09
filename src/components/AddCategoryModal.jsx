// src/components/AddCategoryModal.jsx
import React, { useState, useMemo } from "react";
import api from "../api/axios.js";
import { X, Sparkles, Plus, Trash2 } from "lucide-react";
import { RECOMMENDED_CATEGORIES } from "../constants/categories.js";

const AddCategoryModal = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  existingCategories = [],
}) => {
  const [categories, setCategories] = useState([""]);
  const [selectedRecommended, setSelectedRecommended] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Create a memoized Set of existing category names for efficient, case-insensitive checking.
  const existingCategoryNames = useMemo(() =>
    new Set(existingCategories.map(cat => cat.name.toLowerCase().trim()))
  , [existingCategories]);

  // Filter the recommended list to exclude categories that already exist.
  const filteredRecommended = RECOMMENDED_CATEGORIES.filter(
    name => !existingCategoryNames.has(name.toLowerCase().trim())
  );

  if (!isOpen) return null;

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setSubmitError(null); // Clear previous errors on a new attempt

    const manualCategories = categories
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    const allCategories = [...new Set([...manualCategories, ...selectedRecommended])];
    
    if (allCategories.length === 0 || !user || !user.id) return;

    // --- DUPLICATE VALIDATION ---
    const duplicateCategory = allCategories.find(name => 
      existingCategoryNames.has(name.toLowerCase().trim())
    );

    if (duplicateCategory) {
      setSubmitError(`Category "${duplicateCategory}" already exists.`);
      return; // Halt the submission
    }
    // --- END DUPLICATE VALIDATION ---

    setIsSubmitting(true);

    try {
      await Promise.all(
        allCategories.map(name =>
          api.post(`/categories?userId=${user.id}`, {
            name,
            parentId: null,
          })
        )
      );

      onSuccess();
      setCategories([""]);
      setSelectedRecommended([]);
    } catch (error) {
      console.error("Failed to add categories:", error);
      setSubmitError(
        `Failed to add: ${error.response?.data?.message || error.message}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (index, value) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };

  const handleAddField = () => {
    setCategories([...categories, ""]);
  };

  const handleRemoveField = (index) => {
    if (categories.length > 1) {
      const newCategories = categories.filter((_, i) => i !== index);
      setCategories(newCategories);
    }
  };

  const handleRecommendationClick = (categoryName) => {
    if (selectedRecommended.includes(categoryName)) {
      setSelectedRecommended(selectedRecommended.filter(cat => cat !== categoryName));
    } else {
      setSelectedRecommended([...selectedRecommended, categoryName]);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-600 transition-colors bg-red-500 rounded"
          disabled={isSubmitting}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Add New Categories
        </h2>

        <form onSubmit={handleAddCategory} className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Names
            </label>
            
            {categories.map((category, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  placeholder="Rent, Groceries, Salary..."
                  className="flex-1 px-4 py-2 bg-white rounded-lg 
                   shadow-[inset_0_1px_3px_0_rgba(0,0,0,0.1)] 
                   focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                   transition duration-150 ease-in-out outline-none text-black"
                />
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="p-2 text-red-500 bg-transparent hover:bg-red-50 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddField}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orange-500
              hover:bg-orange-600 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              Add Another Category
            </button>
          </div>

          {/* Recommended Categories */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Sparkles size={14} className="text-orange-500" />
              <label className="text-xs font-medium text-gray-600">
                Recommended {selectedRecommended.length > 0 && `(${selectedRecommended.length} selected)`}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Use the filtered list for rendering */}
              {filteredRecommended.map((categoryName) => {
                const isSelected = selectedRecommended.includes(categoryName);
                return (
                  <button
                    key={categoryName}
                    type="button"
                    onClick={() => handleRecommendationClick(categoryName)}
                    className={`px-3 py-1 text-xs font-medium rounded-full 
                    transition-all duration-200 border
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
                    ${isSelected 
                      ? 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600' 
                      : 'text-gray-700 bg-gray-100 border-gray-200 hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300'
                    }`}
                  >
                    {categoryName}
                  </button>
                );
              })}
            </div>
          </div>

          {submitError && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={!user || isSubmitting || (categories.every(cat => cat.trim() === "") && selectedRecommended.length === 0)}
            className="w-full bg-green-500 text-white font-medium py-2 rounded-lg 
            hover:bg-orange-600 transition duration-200 ease-in-out shadow-md 
            disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : (() => {
              const totalCount = new Set([...categories.filter(c => c.trim()).map(c => c.trim()), ...selectedRecommended]).size;
              return `Add ${totalCount} ${totalCount === 1 ? 'Category' : 'Categories'}`;
            })()}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;