import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/utils/Sidebar';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories';
import CategoryExpensesTable from '../components/categories/CategoryExpensesTable';
import ConfirmationModal from '../components/utils/ConfirmationModal'; // Import the modal

const CategoryPage = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [categoryDetails, setCategoryDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for modal visibility

    // Derive constants from categoryDetails state
    const categoryName = categoryDetails?.name || '';
    const CategoryIcon = CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
    const categoryColor = CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.default;

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/categories/${categoryId}`);
                setCategoryDetails(response.data);
            } catch (error) {
                console.error('Error fetching category details:', error);
                if (error.response && error.response.status === 404) {
                    navigate('/categories');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (categoryId) {
            fetchCategoryDetails();
        }
    }, [categoryId, navigate]);

    const handleToggleFixed = async () => {
        if (!categoryDetails) return;
        
        setIsUpdating(true);
        const newFixedStatus = !categoryDetails.fixed;

        try {
            setCategoryDetails(prevDetails => ({ ...prevDetails, fixed: newFixedStatus }));
            await api.put(`/categories/${categoryId}`, {
                ...categoryDetails,
                fixed: newFixedStatus
            });
        } catch (error) {
            console.error('Error updating fixed status:', error);
            setCategoryDetails(prevDetails => ({ ...prevDetails, fixed: !newFixedStatus }));
            alert('Failed to update status. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    // This function now just opens the modal
    const handleDeleteCategory = () => {
        setIsDeleteModalOpen(true);
    };

    // This function contains the actual deletion logic and is passed to the modal
    const confirmDeleteCategory = async () => {
        try {
            await api.delete(`/categories/${categoryId}`);
            navigate('/categories');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete the category. Please try again.');
        }
    };

    return (
        <>
            <div className="bg-gray-50 px-24 py-4 min-h-screen w-screen flex font-alan">
                <Sidebar />
                <main className="flex-1 p-6 pb-16">
                    <header className="mb-8">
                        <Link to="/categories" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6">
                            <ArrowLeft size={20} />
                            Back to Categories
                        </Link>
                        
                        {isLoading || !categoryDetails ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categoryColor}20` }}>
                                        <CategoryIcon size={32} style={{ color: categoryColor }} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-4xl font-bold text-gray-800">{categoryName}</h1>
                                            {categoryDetails.fixed && (
                                                <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Fixed</span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 mt-1">Expense history and details</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-medium text-gray-700">Fixed</label>
                                        <button
                                            onClick={handleToggleFixed}
                                            disabled={isUpdating}
                                            className={`relative w-14 h-7 rounded-full transition-colors flex items-center p-1 ${
                                                categoryDetails.fixed ? "bg-orange-500" : "bg-gray-300"
                                            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <span
                                                className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                                                    categoryDetails.fixed ? "translate-x-7" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <button onClick={handleDeleteCategory} disabled={isUpdating} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md text-sm disabled:opacity-50">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </header>
                    
                    {!isLoading && categoryDetails && (
                        <CategoryExpensesTable
                            categoryId={categoryId} 
                            categoryColor={categoryColor} 
                        />
                    )}
                </main>
            </div>

            {/* --- RENDER THE MODAL --- */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteCategory}
                title="Delete Category"
                message={`Are you sure you want to delete the "${categoryName}" category? This will permanently delete all associated expenses.`}
                confirmButtonText="Delete"
            />
        </>
    );
};

export default CategoryPage;