import React, { useState, useEffect, useMemo } from 'react';
import { X, Save } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ServiceData {
  id?: string;
  title: string;
  short_description: string;
  long_description: string;
}

interface ServiceModalProps {
  data?: ServiceData;
  onSave: (data: ServiceData) => void;
  onClose: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ data, onSave, onClose }) => {
  const [formData, setFormData] = useState<ServiceData>({
    id: data?.id,
    title: data?.title || '',
    short_description: data?.short_description || '',
    long_description: data?.long_description || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id,
        title: data.title || '',
        short_description: data.short_description || '',
        long_description: data.long_description || '',
      });
    }
  }, [data]);

  // Custom toolbar configuration for the editor
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ],
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  const handleLongDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      long_description: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.short_description.trim()) {
      newErrors.short_description = 'Short description is required';
    }
    if (!formData.long_description.trim() || formData.long_description === '<p><br></p>') {
      newErrors.long_description = 'Long description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const serviceData = {
        id: formData.id,
        title: formData.title,
        short_description: formData.short_description,
        long_description: formData.long_description,
      };

      onSave(serviceData);
    } catch (err) {
      console.error('Error saving service:', err);
      setErrors({ general: 'Failed to save service. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{data ? 'Edit Service' : 'Add Service'}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              required
              disabled={loading}
              placeholder="Enter service title"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
            <textarea
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.short_description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              rows={3}
              required
              disabled={loading}
              placeholder="Enter a brief summary of the service"
            />
            {errors.short_description && <p className="text-red-600 text-sm mt-1">{errors.short_description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Long Description *</label>
            <div className={`border ${errors.long_description ? 'border-red-500' : 'border-gray-300'} rounded-lg`}>
              <ReactQuill
                theme="snow"
                value={formData.long_description}
                onChange={handleLongDescriptionChange}
                modules={modules}
                formats={formats}
                placeholder="Enter detailed service description"
                className="bg-white"
              />
            </div>
            {errors.long_description && <p className="text-red-600 text-sm mt-1">{errors.long_description}</p>}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Service'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;