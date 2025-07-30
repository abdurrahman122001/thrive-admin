import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface ServiceData {
  id?: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

interface ServiceModalProps {
  data?: ServiceData;
  onSave: (data: ServiceData) => void;
  onClose: () => void;
}

const iconOptions = [
  { value: 'Zap', label: 'Zap' },
  { value: 'TrendingUp', label: 'Trending Up' },
  { value: 'Server', label: 'Server' },
];

const ServiceModal: React.FC<ServiceModalProps> = ({ data, onSave, onClose }) => {
  const [formData, setFormData] = useState<ServiceData>(
    data || {
      title: '',
      description: '',
      icon: 'Zap',
      features: ['']
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedFeatures = formData.features.filter(feature => feature.trim() !== '');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/services', {
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        features: cleanedFeatures,
      });
      onSave(response.data); // Pass the created service data back to the parent
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.error('Error saving service:', error);
      // Handle error (e.g., show a notification to the user)
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{data ? 'Edit Service' : 'Add Service'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Service</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;