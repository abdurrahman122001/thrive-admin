import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import axios from 'axios';

interface TeamData {
  id?: string;
  name: string;
  position: string;
  image: string | File; // Can be a URL (for edits) or File (for uploads)
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
  const [formData, setFormData] = useState<TeamData>(
    data || {
      name: '',
      position: '',
      image: '',
      social_links: {}
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Validate file size (2MB)
        setErrors({ ...errors, image: 'Image size must be less than 2MB' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
        setErrors({ ...errors, image: 'Image must be JPEG, PNG, JPG, or GIF' });
        return;
      }
      setImageFile(file);
      setFormData({ ...formData, image: file });
      setErrors({ ...errors, image: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('position', formData.position);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // Prepare social_links as an array of objects using FormData array syntax
      const socialLinks: { key: string; value: string }[] = [];
      if (formData.social_links?.twitter && formData.social_links.twitter.trim()) {
        socialLinks.push({ key: 'twitter', value: formData.social_links.twitter.trim() });
      }
      if (formData.social_links?.linkedin && formData.social_links.linkedin.trim()) {
        socialLinks.push({ key: 'linkedin', value: formData.social_links.linkedin.trim() });
      }
      if (formData.social_links?.facebook && formData.social_links.facebook.trim()) {
        socialLinks.push({ key: 'facebook', value: formData.social_links.facebook.trim() });
      }

      socialLinks.forEach((link, index) => {
        formDataToSend.append(`social_links[${index}][key]`, link.key);
        formDataToSend.append(`social_links[${index}][value]`, link.value);
      });

      let response;
      if (data?.id) {
        // Update existing team member
        formDataToSend.append('_method', 'PUT'); // Laravel expects _method for PUT requests with FormData
        response = await axios.post(`http://127.0.0.1:8000/api/teams/${data.id}/update`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new team member
        if (!imageFile) {
          setErrors({ image: 'Image is required for new team members' });
          setLoading(false);
          return;
        }
        response = await axios.post('http://127.0.0.1:8000/api/teams/create', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSave(response.data);
    } catch (err: any) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        const formattedErrors: { [key: string]: string } = {};
        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = validationErrors[key][0]; // Take first error message
        });
        setErrors(formattedErrors);
      } else {
        setErrors({ general: `Failed to save team member: ${err.message}` });
      }
      console.error('Error saving team member:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{data ? 'Edit Team Member' : 'Add Team Member'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && <p className="text-red-600">{errors.general}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
              disabled={loading}
              maxLength={255}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className={`w-full px-4 py-3 border ${errors.position ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
              disabled={loading}
              maxLength={255}
            />
            {errors.position && <p className="text-red-600 text-sm mt-1">{errors.position}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleImageChange}
              className={`w-full px-4 py-3 border ${errors.image ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required={!data}
              disabled={loading}
            />
            {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
            {(formData.image || imageFile) && (
              <div className="mt-3">
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image as string} 
                  alt="Preview" 
                  className="w-24 h-24 object-cover rounded-full mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
            <div className="space-y-4">
              <input
                type="url"
                placeholder="Twitter URL"
                value={formData.social_links?.twitter || ''}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                className={`w-full px-4 py-3 border ${errors.social_links ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={loading}
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={formData.social_links?.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })}
                className={`w-full px-4 py-3 border ${errors.social_links ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={loading}
              />
              <input
                type="url"
                placeholder="Facebook URL"
                value={formData.social_links?.facebook || ''}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, facebook: e.target.value } })}
                className={`w-full px-4 py-3 border ${errors.social_links ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={loading}
              />
              {errors.social_links && <p className="text-red-600 text-sm mt-1">{errors.social_links}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-blue-400"
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