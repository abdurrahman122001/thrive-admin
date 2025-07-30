import React, { useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { ContentData, Service } from '../../types';
import ServiceModal from '../modals/ServiceModal';
import { useApiFetch } from './useApiFetch';

interface ServicesSectionProps {
  contentData: ContentData;
  updateContent: (data: ContentData) => void;
  showModal: string | null;
  setShowModal: (modal: string | null) => void;
  setEditingItem: (item: any) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  contentData,
  updateContent,
  showModal,
  setShowModal,
  setEditingItem,
}) => {
  const { data: services, loading, error, fetchData } = useApiFetch<Service>('services', [], contentData, updateContent);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (item?: Service) => {
    setEditingItem(item);
    setShowModal('service');
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
      });
      const updatedServices = services.filter(service => service.id !== id);
      updateContent({ ...contentData, services: updatedServices });
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Services</h2>
        <button
          onClick={() => handleEdit()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>
      {loading && <p>Loading services...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
              <div className="space-y-1">
                {(service.features ?? []).map((feature: string, index: number) => (
                  <div key={index} className="text-xs text-gray-500 flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal === 'service' && (
        <ServiceModal
          data={services.find(s => s.id === (showModal ? (showModal as any).id : undefined))}
          onSave={async (data) => {
            try {
              let updatedServices;
              if (data.id) {
                await axios.put(`http://127.0.0.1:8000/api/services/${data.id}`, data, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
                });
                updatedServices = services.map(s => s.id === data.id ? data : s);
              } else {
                const response = await axios.post('http://127.0.0.1:8000/api/services', data, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
                });
                updatedServices = [...services, { ...response.data, id: response.data.id }];
              }
              updateContent({ ...contentData, services: updatedServices });
            } catch (err) {
              console.error('Error saving service:', err);
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

export default ServicesSection;