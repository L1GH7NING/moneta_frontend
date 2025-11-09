import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryExpensesTable = ({ categoryId, categoryColor }) => {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        // This function now lives inside the component that needs it.
        const fetchExpenses = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/expenses', {
                    params: {
                        categoryId: categoryId,
                        page: currentPage,
                        size: 10,
                        sortBy: 'expenseDate',
                        sortDir: 'desc'
                    }
                });

                setExpenses(response.data);
                const totalCount = response.headers['x-total-count'];
                setTotalPages(Math.ceil(totalCount / 10));

            } catch (error) {
                console.error('Error fetching expenses:', error);
                // Optionally handle error state for the table
            } finally {
                setIsLoading(false);
            }
        };

        if (categoryId) {
            fetchExpenses();
        }
    }, [categoryId, currentPage]); // Re-fetches when category or page changes

    // Helper functions specific to this component
    const formatDate = (dateString) => new Date(dateString).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "INR" }).format(amount);

    // Pagination handlers
    const handleNextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); };
    const handlePreviousPage = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 bg-white rounded-lg shadow-md">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: categoryColor }}></div>
            </div>
        );
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Expense History</h2>
            {expenses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 text-lg">No expenses found for this category.</p>
                </div>
            ) : (
                <div>
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <table className="min-w-full">
                            <thead style={{ backgroundColor: `${categoryColor}20` }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: categoryColor }}>Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: categoryColor }}>Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: categoryColor }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-semibold text-gray-800">{expense.description}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-600">{formatDate(expense.expenseDate)}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right"><p className="font-bold text-lg text-gray-800">{formatCurrency(expense.amount)}</p></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-between items-center">
                            <button onClick={handlePreviousPage} disabled={currentPage === 0} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft size={20} /> Previous
                            </button>
                            <span className="text-gray-600">Page {currentPage + 1} of {totalPages}</span>
                            <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                                Next <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default CategoryExpensesTable;