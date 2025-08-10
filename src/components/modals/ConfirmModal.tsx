import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full ${danger ? 'bg-red-100' : 'bg-blue-100'} flex items-center justify-center`}>
              {danger ? (
                <AlertTriangle className={`h-6 w-6 ${danger ? 'text-red-600' : 'text-blue-600'}`} />
              ) : (
                <Check className={`h-6 w-6 ${danger ? 'text-red-600' : 'text-blue-600'}`} />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>{message}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;