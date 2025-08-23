import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { ContentData, About } from '../../types';
import AboutModal from '../modals/AboutModal';
import { useApiFetch } from './useApiFetch';

interface AboutSectionProps {
  contentData: ContentData;
  updateContent: (data: ContentData) => void;
  showModal: string | null;
  setShowModal: (modal: string | null) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://thriveenterprisesolutions.com.au/admin';

const AboutSection: React.FC<AboutSectionProps> = ({
  contentData,
  updateContent,
  showModal,
  setShowModal,
}) => {
  const {
    data: abouts,
    loading,
    error,
    fetchData
  } = useApiFetch<About>('abouts', [], contentData, updateContent);

  const [editingItem, setEditingItem] = useState<About | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData(true); // fresh load
  }, [fetchData]);

  const handleEdit = (item?: About) => {
    setEditingItem(item || {
      id: undefined,
      title: '',
      description: '',
      image: ''
    });
    setShowModal('about');
    setApiError(null);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsProcessing(true);
      await axios.delete(`${API_URL}/api/abouts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
          'Content-Type': 'application/json'
        },
      });

      const updatedAbouts = abouts.filter(about => about.id !== parseInt(id));
      updateContent({
        ...contentData,
        about: updatedAbouts[0] || contentData.about
      });

      fetchData(true); 
    } catch (err) {
      console.error('Error deleting about:', err);
      setApiError('Failed to delete about section. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (data: About) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      if ((data as any).imageFile) {
        formData.append('image', (data as any).imageFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (data.id) {
        await axios.post(`${API_URL}/api/abouts/${data.id}?_method=PUT`, formData, config);
      } else {
        await axios.post(`${API_URL}/api/abouts`, formData, config);
      }

      // Refresh to get updated_at and new image path
      await fetchData(true);

      setShowModal(null);
    } catch (err) {
      console.error(err);
      setApiError("Failed to save data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getImageUrl = (imagePath: string, updatedAt?: string) => {
    if (!imagePath) return '';
    let basePath = imagePath.startsWith('http')
      ? imagePath
      : imagePath.startsWith('storage/')
        ? `${API_URL}/${imagePath}`
        : `${API_URL}/storage/${imagePath}`;
    basePath += `?v=${updatedAt ? new Date(updatedAt).getTime() : Date.now()}`;
    return basePath;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">About Information</h2>
        <button
          onClick={() => handleEdit()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          disabled={loading || isProcessing}
        >
          <Plus className="w-4 h-4" />
          <span>Add About</span>
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading about information...</p>}
      {(error || apiError) && (
        <p className="text-red-600 mb-4">{error || apiError}</p>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-6">
          {abouts.length === 0 ? (
            <p className="text-gray-500">No about sections found. Click "Add About" to create one.</p>
          ) : (
            abouts.map((about) => (
              <div key={about.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{about.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(about)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      disabled={isProcessing}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(about.id.toString())}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {about.image && (
                  <img
                    src={getImageUrl(about.image, (about as any).updated_at)}
                    alt={about.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}

                <p className="text-gray-600 whitespace-pre-line">
                  {about.description || 'No description provided'}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {showModal === 'about' && editingItem && (
        <AboutModal
          data={editingItem}
          onSave={handleSave}
          onClose={() => {
            setShowModal(null);
            setEditingItem(null);
          }}
          isProcessing={isProcessing}
          error={apiError}
        />
      )}
    </div>
  );
};

export default AboutSection;
