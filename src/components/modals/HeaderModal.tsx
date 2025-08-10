import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Header } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface HeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: Header;
  setFormData: React.Dispatch<React.SetStateAction<Header>>;
  editingId: number | null;
}

const API_URL = "https://thriveenterprisesolutions.com.au/admin/api/headers";

const HeaderModal: React.FC<HeaderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  editingId,
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId && !formData.menu_items?.length) {
      setFormData(prev => ({
        ...prev,
        menu_items: [''],
      }));
    }
  }, [editingId, formData.menu_items, setFormData]);

  const handleMenuItemChange = (index: number, value: string) => {
    const updatedItems = [...(formData.menu_items || [])];
    updatedItems[index] = value;
    setFormData({ ...formData, menu_items: updatedItems });
  };

  const handleAddMenuItem = () => {
    setFormData(prev => ({
      ...prev,
      menu_items: [...(prev.menu_items || []), ''],
    }));
  };

  const handleRemoveMenuItem = (index: number) => {
    const updatedItems = [...(formData.menu_items || [])];
    updatedItems.splice(index, 1);
    setFormData({ ...formData, menu_items: updatedItems });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

const handleSave = async () => {
  try {
    const data = new FormData();
    if (logoFile) {
      data.append('logo_path', logoFile);
    }
    formData.menu_items.forEach((item, index) => {
      data.append(`menu_items[${index}]`, item);
    });

    if (editingId) {
      await axios.post(`${API_URL}/${editingId}?_method=PUT`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      await axios.post(API_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    onSave();
    onClose();
  } catch (error) {
    console.error("Error saving header:", error);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-lg font-bold mb-4">
          {editingId ? 'Edit Header' : 'Create Header'}
        </h2>

        {/* Logo Upload */}
        <div className="mb-3">
          <label className="block font-semibold mb-1">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="border rounded px-3 py-2 w-full"
          />
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="mt-2 w-32 h-32 object-contain border" />
          )}
        </div>

        {/* Menu Items */}
        <div className="mb-3">
          <label className="form-label font-semibold mb-2 block">Menu Items</label>
          {(formData.menu_items || []).map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                placeholder={`Menu item ${index + 1}`}
                value={item}
                onChange={(e) => handleMenuItemChange(index, e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              />
              <button
                type="button"
                onClick={() => handleRemoveMenuItem(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddMenuItem}
            className="flex items-center mt-2 text-blue-600 hover:text-blue-800"
          >
            <Plus size={18} className="mr-1" /> Add Menu Item
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={handleSave}
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

export default HeaderModal;
