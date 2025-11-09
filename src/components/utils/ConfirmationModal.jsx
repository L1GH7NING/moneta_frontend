// src/components/ConfirmationModal.jsx
import React from 'react';

const ConfirmationModal = ({
    isOpen,                 // Boolean: Controls visibility of the modal
    onClose,                // Function: Called when the modal is closed (e.g., via cancel or backdrop click)
    onConfirm,              // Function: Called when the confirm button is clicked
    title,                  // String: Title of the modal (e.g., "Confirm Deletion")
    message,                // String: Detailed message (e.g., "Are you sure you want to delete this category?")
    confirmButtonText = 'Confirm', // String: Text for the confirm button
    confirmButtonColor = 'bg-red-600 hover:bg-red-700', // Tailwind classes for button color
}) => {
    
    // If the modal is not open, return null to render nothing
    if (!isOpen) {
        return null;
    }

    // Handle background click (optional, but a nice UX feature)
    const handleBackdropClick = (e) => {
        // Only close if the click is directly on the backdrop (the outer div)
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    // Handle the confirm action
    const handleConfirm = () => {
        onConfirm();
        onClose(); // Close the modal after confirming
    };

    return (
        // Backdrop
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300"
            onClick={handleBackdropClick}
        >
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm m-4 transform transition-all duration-300 scale-100 opacity-100">
                
                {/* Header */}
                <div className="p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                </div>
                
                {/* Body/Message */}
                <div className="p-4">
                    <p className="text-gray-600">{message}</p>
                </div>
                
                {/* Footer/Actions */}
                <div className="p-4 border-t flex justify-end space-x-3">
                    {/* Cancel Button */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    
                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition duration-150 ${confirmButtonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600`}
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;