import React, { useEffect } from 'react';
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
  setEditingItem: (item: any) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  contentData,
  updateContent,
  showModal,
  setShowModal,
  setEditingItem,
}) => {
  const { data: abouts, loading, error, fetchData } = useApiFetch<About>('abouts', [], contentData, updateContent);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (item?: About) => {
    setEditingItem(item || { title: '', description: '', image: '' });
    setShowModal('about');
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/abouts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
      });
      const updatedAbouts = abouts.filter(about => about.id !== parseInt(id));
      updateContent({ ...contentData, about: updatedAbouts[0] || contentData.about });
    } catch (err) {
      console.error('Error deleting about:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">About Information</h2>
        <button
          onClick={() => handleEdit()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add About</span>
        </button>
      </div>
      {loading && <p>Loading about information...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-6">
          {abouts.map((about) => (
            <div key={about.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{about.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(about)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(about.id.toString())}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {about.image && (
                <img
                  src={about.image}
                  alt={about.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    console.error(`Failed to load image for ${about.title}`);
                  }}
                />
              )}
              <p className="text-gray-600">{about.description}</p>
            </div>
          ))}
        </div>
      )}
      {showModal === 'about' && (
        <AboutModal
          data={abouts.find(a => a.id === (showModal ? (showModal as any).id : undefined)) || { title: '', description: '', image: '' }}
          onSave={async (data) => {
            try {
              let updatedAbouts;
              let response: { data: About };
              const formData = new FormData();
              formData.append('title', data.title);
              formData.append('description', data.description || '');
              if (data.image instanceof File) {
                formData.append('image', data.image);
              }
              if (data.id) {
                response = await axios.put(`http://127.0.0.1:8000/api/abouts/${data.id}`, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
                  },
                });
                updatedAbouts = abouts.map(a => a.id === data.id ? { ...response.data, image: response.data.image ? `http://127.0.0.1:8000/storage/${response.data.image}` : '' } : a);
              } else {
                response = await axios.post('http://127.0.0.1:8000/api/abouts', formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
                  },
                });
                updatedAbouts = [...abouts, { ...response.data, image: response.data.image ? `http://127.0.0.1:8000/storage/${response.data.image}` : '' }];
              }
              updateContent({ ...contentData, about: updatedAbouts[0] || contentData.about });
            } catch (err) {
              console.error('Error saving about:', err);
            } finally {
              setShowModal(null);
              setEditingItem(null);
            }
          }}
          onClose={() => {
            setShowModal(null);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default AboutSection;