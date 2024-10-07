export const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg">
          <h2 className="text-lg font-bold">Confirm Deletion</h2>
          <p>Are you sure you want to delete this log?</p>
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="mr-2 px-4 py-2 border rounded bg-gray-300">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-4 py-2 border rounded bg-red-500 text-white">
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };