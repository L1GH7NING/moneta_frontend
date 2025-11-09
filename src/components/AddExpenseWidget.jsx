import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Edit,
  X,
} from "lucide-react";
import api from "../api/axios.js";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../constants/categories.js"; 
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const customSelectStyles = {
  control: (baseStyles) => ({
    ...baseStyles,
    border: 0,
    boxShadow: 'none',
    background: 'transparent',
    fontFamily: 'Alan Sans', 
    cursor: 'pointer',
    minHeight: '48px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'black',
    fontFamily: 'Alan Sans',
  }),
  option: (provided, state) => ({
    ...provided,
    color: 'black',
    backgroundColor: state.isFocused ? '#eff6ff' : (state.isSelected ? '#3b82f6' : 'white'),
    fontFamily: 'Alan Sans',
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
      ...provided,
      color: '#6b7280',
      fontFamily: 'Alan Sans',
  }),
  input: (provided) => ({
      ...provided,
      color: 'transparent',
      fontFamily: 'inherit',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
};


const AddExpenseWidget = ({
  user,
  categories,
  onExpenseAdded,
  refreshTrigger,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rows, setRows] = useState([
    { id: 1, description: "", category: null, amount: "" },
  ]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const categoryMap = useMemo(() => {
    const flatMap = new Map();
    if (!categories) return flatMap;
    categories.forEach(cat => { flatMap.set(cat.id.toString(), cat); });
    return flatMap;
  }, [categories]);

  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    return categories.map(cat => ({ value: cat.id.toString(), label: cat.name }));
  }, [categories]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDisplayDate = (date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    if (compareDate.getTime() === today.getTime()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (compareDate.getTime() === yesterday.getTime()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(0, 0, 0, 0);
    if (newDate.getTime() <= today.getTime()) setSelectedDate(newDate);
  };
  
  const isToday = () => {
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  const handleAmountChange = (id, value) => {
    const re = /^[0-9]*\.?[0-9]*$/;
    if (value === "" || re.test(value)) updateRow(id, "amount", value);
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    if (editingId) {
      setError("Please save or cancel the current edit before adding a new row.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    const newId = Math.max(...rows.map((r) => r.id), 0) + 1;
    setRows([...rows, { id: newId, description: "", category: null, amount: "" }]);
  };

  const deleteRow = (id) => {
    if (editingId && rows.length === 1 && rows[0].id === id) {
      setError("Cannot delete the edit row. Click Cancel to discard changes.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (rows.length > 1) setRows(rows.filter((row) => row.id !== id));
  };

  const CustomDatePickerInput = React.forwardRef(({ onClick }, ref) => (
    <button onClick={onClick} ref={ref} className="text-lg font-semibold transition-colors bg-transparent text-black">
      {formatDisplayDate(selectedDate)}
    </button>
  ));
  
  const handleEditExpense = (expense) => {
    setRows([]);
    const categoryIdStr = expense.categoryId.toString();
    const catInfo = categoryMap.get(categoryIdStr);
    const categoryOption = catInfo ? { value: categoryIdStr, label: catInfo.name } : null;
    setRows([{
      id: expense.id,
      description: expense.description,
      category: categoryOption,
      amount: expense.amount.toString(),
    }]);
    setEditingId(expense.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRows([{ id: 1, description: "", category: null, amount: "" }]);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    setDeletingId(expenseId);
    setError("");
    try {
      await api.delete(`/expenses/${expenseId}`);
      setDailyExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      setError("Failed to delete expense. Check console for details.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const calculateTotal = () => {
    const currentDailyExpenses = dailyExpenses.filter((exp) => exp.id !== editingId);
    const dailyTotal = currentDailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const newRowsTotal = rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    return (dailyTotal + newRowsTotal).toFixed(2);
  };

  const handleSaveAll = async () => {
    const rowsToProcess = editingId ? rows : rows.filter(
      (row) => row.description && row.category && row.amount && parseFloat(row.amount) > 0
    );
    if (rowsToProcess.length === 0) {
      setError("Please add at least one complete expense or fix the edited expense.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setLoading(true);
    setError("");
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const expenseDate = `${year}-${month}-${day}`;
    try {
      const commonPayload = (row) => ({
        description: row.description,
        categoryId: row.category.value,
        amount: parseFloat(row.amount),
        expenseDate: expenseDate,
      });
      if (editingId) {
        await api.put(`/expenses/${editingId}`, commonPayload(rowsToProcess[0]));
        setEditingId(null);
      } else {
        const promises = rowsToProcess.map((row) => api.post("/expenses", commonPayload(row)));
        await Promise.all(promises);
      }
      setRows([{ id: 1, description: "", category: null, amount: "" }]);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      console.error(`Failed to ${editingId ? "update" : "save"} expenses:`, err);
      setError(`Failed to ${editingId ? "update" : "save"} expenses. Check console for details.`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId) => {
    const idStr = categoryId ? categoryId.toString() : '';
    if (categoryMap.has(idStr)) {
        const cat = categoryMap.get(idStr);
        const name = cat.name;
        const color = CATEGORY_COLORS[name] || CATEGORY_COLORS.default;
        const Icon = CATEGORY_ICONS[name] || CATEGORY_ICONS.default;
        return { name, color, Icon };
    }
    return { name: "Unknown", color: CATEGORY_COLORS.default, Icon: CATEGORY_ICONS.default };
  };

  const formatOptionLabel = ({ value, label }) => {
    if (value === "-1") {
      return (
        <div className="font-bold text-blue-600">
          {label}
        </div>
      );
    }
    const { color, Icon } = getCategoryInfo(value);
    return (
      <div className="flex items-center">
        <Icon className="w-4 h-4 mr-3 flex-shrink-0" style={{ color }} />
        <span>{label}</span>
      </div>
    );
  };

  useEffect(() => {
    const fetchDailyExpenses = async () => {
      if (!user) return;
      setDailyLoading(true);
      setDailyExpenses([]);
      setEditingId(null);
      setRows([{ id: 1, description: "", category: null, amount: "" }]);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();
      try {
        const response = await api.get("/expenses/filter", {
          params: { year, month, day, _t: Date.now() },
        });
        setDailyExpenses(response.data);
      } catch (error) {
        console.error("Failed to fetch daily expenses:", error);
      } finally {
        setDailyLoading(false);
      }
    };
    fetchDailyExpenses();
  }, [selectedDate, user, refreshTrigger]);

  return (
    <div className="bg-white rounded-lg shadow-lg w-full mb-6 px-6">
      <div className="flex items-center justify-between px-6 py-4 border-gray-200 border-b">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevDay} className="p-1 hover:bg-gray-200 rounded transition-colors bg-transparent rounded-full">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} maxDate={new Date()} customInput={<CustomDatePickerInput />} />
          <button onClick={handleNextDay} disabled={isToday()} className={`p-1 hover:bg-gray-200 rounded transition-colors bg-transparent rounded-full ${isToday() ? "opacity-50 cursor-not-allowed" : ""}`}>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {editingId ? (
          <button onClick={handleCancelEdit} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            <X className="w-4 h-4" /> Cancel Edit
          </button>
        ) : (
          <button onClick={addRow} disabled={dailyLoading} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            <Plus className="w-4 h-4" /> Add Row
          </button>
        )}
      </div>

      <div className="py-6 px-4">
        <div className="rounded-lg border border-gray-200 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="bg-blue-600">
                <th className="px-4 py-3 text-left text-lg font-semibold text-white border-r border-b border-r-blue-700 border-b-blue-700 max-w-xs">Description</th>
                <th className="px-4 py-3 text-left text-lg font-semibold text-white border-r border-b border-r-blue-700 border-b-blue-700 w-64">Category</th>
                <th className="px-4 py-3 text-left text-lg font-semibold text-white border-r border-b border-r-blue-700 border-b-blue-700 w-48">Amount</th>
                <th className="px-4 py-3 text-left text-lg font-semibold text-white last:border-r-0 border-r border-b border-b-blue-700 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dailyLoading ? (
                <tr><td colSpan="4" className="text-center py-6 text-gray-500"><Loader2 className="animate-spin w-5 h-5 inline mr-2" />Loading expenses for {formatDisplayDate(selectedDate)}...</td></tr>
              ) : (
                dailyExpenses.length > 0 && (
                  <>
                    {dailyExpenses.filter((exp) => exp.id !== editingId).map((expense) => {
                      const { name, color, Icon } = getCategoryInfo(expense.categoryId);
                      return (
                        <tr key={expense.id} className="bg-blue-50/50 text-gray-700">
                          <td className="px-4 py-3 border-r border-b border-gray-400 max-w-xs" title={expense.description}>
                            <div className="truncate">
                              {expense.description}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-r border-b border-gray-400">
                            <div className="flex items-center">
                                <Icon className="w-4 h-4 mr-2" style={{ color }} />
                                <span style={{ color: color }} className="font-medium">
                                    {name}
                                </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-r border-b border-gray-400 font-semibold">₹{parseFloat(expense.amount).toFixed(2)}</td>
                          <td className="px-4 py-3 border-r border-b border-b-gray-400">
                            <div className="flex justify-between items-center">
                              <button onClick={() => handleEditExpense(expense)} disabled={deletingId || loading || editingId} className={`p-1 rounded-lg transition-colors text-green-600 bg-transparent ${deletingId || loading || editingId ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"}`} title="Edit Expense"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteExpense(expense.id)} disabled={deletingId === expense.id || loading || editingId} className={`p-1 rounded transition-colors text-red-600 bg-transparent ${deletingId === expense.id || editingId ? "opacity-50 cursor-not-allowed" : "hover:bg-red-100"}`} title="Delete Expense">
                                {deletingId === expense.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                )
              )}
              {rows.map((row) => (
                <tr key={row.id} className={editingId ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"}>
                  <td className="p-0 border-r border-b border-gray-300">
                    <input type="text" value={row.description} onChange={(e) => updateRow(row.id, "description", e.target.value)} placeholder="Enter description" className="w-full h-full px-4 py-3 outline-none focus:bg-blue-50 bg-transparent text-black" />
                  </td>
                  <td className="p-0 border-r border-b border-gray-300 w-64">
                    <Select
                      value={row.category}
                      onChange={(selectedOption) => {
                        if (selectedOption.value === "-1") {
                          navigate("/budgets");
                        } else {
                          updateRow(row.id, "category", selectedOption);
                        }
                      }}
                      options={[...categoryOptions, { value: "-1", label: "+ Create a New Category" }]}
                      formatOptionLabel={formatOptionLabel}
                      placeholder="Select category"
                      menuPortalTarget={document.body}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                    />
                  </td>
                  <td className="p-0 border-r border-b border-gray-300">
                    <input type="text" value={row.amount} onChange={(e) => handleAmountChange(row.id, e.target.value)} placeholder="0.00" inputMode="decimal" className="w-full h-full px-4 py-3 outline-none focus:bg-blue-50 bg-transparent text-black text-left" />
                  </td>
                  <td className="px-4 py-3 border-r border-b border-gray-300 text-center">
                    {editingId ? <span className="text-xs text-gray-500">Edit Mode</span> : (
                      <button onClick={() => deleteRow(row.id)} disabled={rows.length === 1} className={`p-1 rounded ${rows.length === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-red-50 text-red-600"}`}><Trash2 className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
              {!dailyLoading && dailyExpenses.length === 0 && rows.length === 0 && !editingId && (
                <tr><td colSpan="4" className="text-center py-6 text-gray-500">No expenses recorded for this day. Click 'Add Row' to start.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {error && <div className="px-6 py-2 text-red-600 text-sm bg-red-50 border-t border-red-200">{error}</div>}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Total:</span>
          <span className="text-xl font-bold text-gray-900">₹{calculateTotal()}</span>
        </div>
        <button onClick={handleSaveAll} disabled={loading || dailyLoading || deletingId} className={`px-6 py-2 rounded-lg font-semibold transition-all ${loading || dailyLoading || deletingId ? "bg-gray-300 cursor-not-allowed text-gray-500" : editingId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}>
          {loading ? (editingId ? "Updating..." : "Saving...") : (editingId ? "Update Expense" : "Save")}
        </button>
      </div>
    </div>
  );
};

export default AddExpenseWidget;