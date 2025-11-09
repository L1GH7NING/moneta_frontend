
const CategoryListFooter = () => {
    return (
        <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() =>
                console.log("Submit Budget Button Clicked (Placeholder)")
              }
              className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save Monthly Budget
            </button>
        </div>
    );
};

export default CategoryListFooter;