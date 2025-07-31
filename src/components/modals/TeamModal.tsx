import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface TeamData {
  id?: string;
  name: string;
  position: string;
  image: string | File;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

interface TeamModalProps {
  data?: TeamData;
  onSave: (data: TeamData) => void;
  onClose: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ data, onSave, onClose }) => {
  const [formData, setFormData] = useState<TeamData>({
    id: data?.id,
    name: data?.name || '',
    position: data?.position || '',
    image: data?.image || '',
    social_links: data?.social_links || {},
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://thriveenterprisesolutions.com.au/admin';

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id,
        name: data.name || '',
        position: data.position || '',
        image: data.image || '',
        social_links: data.social_links || {},
      });

      if (data.image) {
        if (typeof data.image === 'string') {
          const imageUrl = data.image.startsWith('http') ? data.image : `${API_URL}/storage/${data.image}`;
          setImagePreview(imageUrl);
        } else if (data.image instanceof File) {
          const previewUrl = URL.createObjectURL(data.image);
          setImagePreview(previewUrl);
        }
      } else {
        setImagePreview('');
      }
    } else {
      setFormData({
        name: '',
        position: '',
        image: '',
        social_links: {},
      });
      setImagePreview('');
    }
  }, [data, API_URL]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 2MB' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
        setErrors({ ...errors, image: 'Image must be JPEG, PNG, JPG, or GIF' });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData({ ...formData, image: file });
      setErrors({ ...errors, image: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Name is required' });
      setLoading(false);
      return;
    }

    if (!formData.position.trim()) {
      setErrors({ position: 'Position is required' });
      setLoading(false);
      return;
    }

    if (!data?.id && !formData.image) {
      setErrors({ image: 'Image is required for new team members' });
      setLoading(false);
      return;
    }

    try {
      onSave(formData);
    } catch (err) {
      console.error('Error saving team member:', err);
      setErrors({ general: 'Failed to save team member. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{data ? 'Edit Team Member' : 'Add Team Member'}</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              required
              disabled={loading}
              maxLength={255}
              placeholder="Enter team member name"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.position ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              required
              disabled={loading}
              maxLength={255}
              placeholder="Enter team member position"
            />
            {errors.position && <p className="text-red-600 text-sm mt-1">{errors.position}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {data ? 'Update Image' : 'Upload Image *'}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleImageChange}
              className={`w-full px-4 py-3 border ${errors.image ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              disabled={loading}
            />
            {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                <div className="flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      setErrors({ ...errors, image: 'Failed to load image' });
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Social Links</label>
            <div className="space-y-4">
              <input
                type="url"
                placeholder="Twitter URL"
                value={formData.social_links?.twitter || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, twitter: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={formData.social_links?.linkedin || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, linkedin: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
              <input
                type="url"
                placeholder="Facebook URL"
                value={formData.social_links?.facebook || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, facebook: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>
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
              <span>{loading ? 'Saving...' : 'Save Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;