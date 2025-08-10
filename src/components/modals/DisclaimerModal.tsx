import React, { useEffect } from 'react';
import { Disclaimer } from '../../types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: Disclaimer;
  setFormData: React.Dispatch<React.SetStateAction<Disclaimer>>;
  editingId: number | null;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  editingId,
}) => {
  // Default content
  useEffect(() => {
    if (!editingId && !formData.content) {
      setFormData(prev => ({
        ...prev,
        content: '<p>Enter disclaimer text here...</p>',
      }));
    }
  }, [editingId, formData.content, setFormData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-lg font-bold mb-4">
          {editingId ? 'Edit Disclaimer' : 'Create Disclaimer'}
        </h2>

        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border rounded px-3 py-2 w-full mb-3"
        />

        {/* Content with Quill */}
        <div className="mb-3">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
          />
        </div>

        {/* Status */}
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
          }
          className="border rounded px-3 py-2 w-full mb-3"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
