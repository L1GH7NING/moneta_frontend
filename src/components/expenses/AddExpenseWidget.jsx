import React, { useState, useMemo, useEffect } from "react";
import api from "../../api/axios.js";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories.js";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Edit,
  X,
} from "lucide-react";
import Select from "react-select";

// customSelectStyles remains the same
const customSelectStyles = {
  control: (baseStyles) => ({
    ...baseStyles,
    border: 0,
    boxShadow: "none",
    background: "transparent",
    fontFamily: "Alan Sans",
    cursor: "pointer",
    minHeight: "48px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "black",
    fontFamily: "Alan Sans",
  }),
  option: (provided, state) => ({
    ...provided,
    color: "black",
    backgroundColor: state.isFocused
      ? "#f3f4f6"
      : state.isSelected
      ? "#e5e7eb"
      : "white",
    fontFamily: "Alan Sans",
    cursor: "pointer",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#6b7280",
    fontFamily: "Alan Sans",
  }),
  input: (provided) => ({
    ...provided,
    color: "transparent",
    fontFamily: "inherit",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const AddExpenseWidget = ({
  user,
  categories,
  onExpenseAdded,
  refreshTrigger,
}) => {
  // All state and functions remain the same...
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
    categories.forEach((cat) => {
      flatMap.set(cat.id.toString(), cat);
    });
    return flatMap;
  }, [categories]);

  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    return categories.map((cat) => ({
      value: cat.id.toString(),
      label: cat.name,
    }));
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    if (editingId) {
      setError(
        "Please save or cancel the current edit before adding a new row."
      );
      setTimeout(() => setError(""), 3000);
      return;
    }
    const newId = Math.max(...rows.map((r) => r.id), 0) + 1;
    setRows([
      ...rows,
      { id: newId, description: "", category: null, amount: "" },
    ]);
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
    <button
      onClick={onClick}
      ref={ref}
      className="text-xl font-bold transition-colors bg-transparent text-gray-800"
    >
      {formatDisplayDate(selectedDate)}
    </button>
  ));

  const handleEditExpense = (expense) => {
    setRows([]);
    const categoryIdStr = expense.categoryId.toString();
    const catInfo = categoryMap.get(categoryIdStr);
    const categoryOption = catInfo
      ? { value: categoryIdStr, label: catInfo.name }
      : null;
    setRows([
      {
        id: expense.id,
        description: expense.description,
        category: categoryOption,
        amount: expense.amount.toString(),
      },
    ]);
    setEditingId(expense.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRows([{ id: 1, description: "", category: null, amount: "" }]);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;
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
    const currentDailyExpenses = dailyExpenses.filter(
      (exp) => exp.id !== editingId
    );
    const dailyTotal = currentDailyExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const newRowsTotal = rows.reduce(
      (sum, row) => sum + (parseFloat(row.amount) || 0),
      0
    );
    return (dailyTotal + newRowsTotal).toFixed(2);
  };

  const handleSaveAll = async () => {
    const rowsToProcess = editingId
      ? rows
      : rows.filter(
          (row) =>
            row.description &&
            row.category &&
            row.amount &&
            parseFloat(row.amount) > 0
        );
    if (rowsToProcess.length === 0) {
      setError(
        "Please add at least one complete expense or fix the edited expense."
      );
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
        await api.put(
          `/expenses/${editingId}`,
          commonPayload(rowsToProcess[0])
        );
        setEditingId(null);
      } else {
        const promises = rowsToProcess.map((row) =>
          api.post("/expenses", commonPayload(row))
        );
        await Promise.all(promises);
      }
      setRows([{ id: 1, description: "", category: null, amount: "" }]);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      console.error(
        `Failed to ${editingId ? "update" : "save"} expenses:`,
        err
      );
      setError(
        `Failed to ${
          editingId ? "update" : "save"
        } expenses. Check console for details.`
      );
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId) => {
    const idStr = categoryId ? categoryId.toString() : "";
    if (categoryMap.has(idStr)) {
      const cat = categoryMap.get(idStr);
      const name = cat.name;
      const color = CATEGORY_COLORS[name] || CATEGORY_COLORS.default;
      const Icon = CATEGORY_ICONS[name] || CATEGORY_ICONS.default;
      return { name, color, Icon };
    }
    return {
      name: "Unknown",
      color: CATEGORY_COLORS.default,
      Icon: CATEGORY_ICONS.default,
    };
  };

  const formatOptionLabel = ({ value, label }) => {
    if (value === "-1") {
      return <div className="font-bold text-blue-600">{label}</div>;
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
    <div className="bg-white rounded-lg shadow-lg w-full mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        {/* ... Header remains the same ... */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-transparent"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            maxDate={new Date()}
            customInput={<CustomDatePickerInput />}
          />
          <button
            onClick={handleNextDay}
            disabled={isToday()}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors bg-transparent ${
              isToday() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {editingId ? (
          <button
            onClick={handleCancelEdit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" /> Cancel Edit
          </button>
        ) : (
          <button
            onClick={addRow}
            disabled={dailyLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add New Expense
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {/* --- CORRECTED TABLE STRUCTURE --- */}
          <table className="min-w-full">
            <thead className="bg-orange-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider border-b border-r border-orange-200"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider w-56 border-b border-r border-orange-200"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider w-40 border-b border-r border-orange-200"
                >
                  Amount
                </th>
                {/* Last header cell has no right border */}
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-orange-800 uppercase tracking-wider w-28 border-b border-orange-200"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-50">
              {dailyLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-10 text-gray-500 border-b border-gray-200"
                  >
                    <Loader2 className="animate-spin w-6 h-6 inline mr-3" />
                    Loading...
                  </td>
                </tr>
              ) : (
                dailyExpenses
                  .filter((exp) => exp.id !== editingId)
                  .map((expense) => {
                    const { name, color, Icon } = getCategoryInfo(
                      expense.categoryId
                    );
                    return (
                      <tr
                        key={expense.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r border-gray-200">
                          <div className="flex items-center">
                            <Icon
                              className="w-5 h-5 mr-3 flex-shrink-0"
                              style={{ color }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color }}
                            >
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 border-b border-r border-gray-200">
                          ₹{parseFloat(expense.amount).toFixed(2)}
                        </td>
                        {/* Last data cell has no right border */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => handleEditExpense(expense)}
                              disabled={deletingId || loading || editingId}
                              className="text-green-600 bg-transparent hover:text-green-800 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              disabled={
                                deletingId === expense.id ||
                                loading ||
                                editingId
                              }
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                              title="Delete"
                            >
                              {deletingId === expense.id ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
            <tbody className="bg-white">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={editingId ? "bg-yellow-100/50" : ""}
                >
                  <td className="p-0 border-r border-b border-gray-200">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        updateRow(row.id, "description", e.target.value)
                      }
                      placeholder="e.g., Coffee with friends"
                      className="w-full h-full px-4 py-3 outline-none focus:bg-blue-50 bg-transparent text-black"
                    />
                  </td>
                  <td className="p-0 border-r border-b border-gray-200">
                    <Select
                      value={row.category}
                      onChange={(selectedOption) => {
                        if (selectedOption.value === "-1") {
                          navigate("/categories");
                        } else {
                          updateRow(row.id, "category", selectedOption);
                        }
                      }}
                      options={[
                        ...categoryOptions,
                        { value: "-1", label: "+ Create New Category" },
                      ]}
                      formatOptionLabel={formatOptionLabel}
                      placeholder="Select category"
                      menuPortalTarget={document.body}
                      styles={customSelectStyles}
                    />
                  </td>
                  <td className="p-0 border-r border-b border-gray-200">
                    <input
                      type="text"
                      value={row.amount}
                      onChange={(e) =>
                        handleAmountChange(row.id, e.target.value)
                      }
                      placeholder="0.00"
                      inputMode="decimal"
                      className="w-full h-full px-4 py-3 outline-none focus:bg-blue-50 bg-transparent text-black text-left"
                    />
                  </td>
                  {/* Last input cell has no right border */}
                  <td className="p-0 text-center border-b">
                    {editingId ? (
                      <span className="text-xs font-semibold text-yellow-700">
                        EDITING
                      </span>
                    ) : (
                      <button
                        onClick={() => deleteRow(row.id)}
                        disabled={rows.length === 1}
                        className={`p-2 rounded-xl transition-colors bg-transparent ${
                          rows.length === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-600 hover:bg-red-100 hover:text-red-800"
                        }`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!dailyLoading &&
                dailyExpenses.length === 0 &&
                rows.length === 1 &&
                !rows[0].description &&
                !editingId && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-8 text-gray-500 bg-white border-t border-gray-200"
                    >
                      No expenses recorded for this day. Start by adding one
                      above.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
        {/* ... Footer remains the same ... */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-800">
            Total for {formatDisplayDate(selectedDate)}:
          </span>
          <span className="text-2xl font-bold text-black">
            ₹{calculateTotal()}
          </span>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={loading || dailyLoading || deletingId}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none ${
            editingId
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 inline mr-2" />{" "}
              {editingId ? "Updating..." : "Saving..."}
            </>
          ) : editingId ? (
            "Update Expense"
          ) : (
            "Save All Expenses"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddExpenseWidget;
