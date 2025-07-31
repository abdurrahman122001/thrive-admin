import React, { useState, useEffect, useCallback } from 'react';
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
}

const API_URL = import.meta.env.VITE_API_URL || 'http://thriveenterprisesolutions.com.au/admin';

const ServicesSection: React.FC<ServicesSectionProps> = ({
  contentData,
  updateContent,
  showModal,
  setShowModal,
}) => {
  const { data: services, loading, error, fetchData } = useApiFetch<Service>('services', [], contentData, updateContent);
  const [localServices, setLocalServices] = useState<Service[]>(services);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Sync localServices with fetched services
  useEffect(() => {
    setLocalServices(services);
  }, [services]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((service?: Service) => {
    setEditingService(service || null);
    setShowModal('service');
  }, [setShowModal]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      // Optimistic update: Remove service locally first
      const updatedServices = localServices.filter(service => service.id !== id);
      setLocalServices(updatedServices);
      updateContent({ ...contentData, services: updatedServices });

      // Perform API delete
      await axios.delete(`${API_URL}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
      });

      // Re-fetch to ensure consistency with server
      await fetchData();
    } catch (err) {
      console.error('Error deleting service:', err);
      // Revert optimistic update on error
      setLocalServices(services);
      updateContent({ ...contentData, services });
    }
  }, [localServices, contentData, updateContent, fetchData, services]);

  const handleSave = useCallback(async (data: Service) => {
    try {
      let updatedServices;

      if (data.id) {
        // Optimistic update: Update existing service locally
        updatedServices = localServices.map(s => (s.id === data.id ? { ...s, ...data } : s));
        setLocalServices(updatedServices);
        updateContent({ ...contentData, services: updatedServices });

        // Perform API update
        const response = await axios.put(`${API_URL}/api/services/${data.id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
        });
        updatedServices = localServices.map(s => (s.id === data.id ? response.data : s));
      } else {
        // Optimistic update: Add new service locally with temporary ID
        const tempId = `temp-${Date.now()}`;
        updatedServices = [...localServices, { ...data, id: tempId }];
        setLocalServices(updatedServices);
        updateContent({ ...contentData, services: updatedServices });

        // Perform API create
        const response = await axios.post(`${API_URL}/api/services`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
        });
        updatedServices = localServices.map(s => (s.id === tempId ? response.data : s));
      }

      // Update local state with final API response
      setLocalServices(updatedServices);
      updateContent({ ...contentData, services: updatedServices });

      // Re-fetch to ensure consistency with server
      await fetchData();

      setShowModal(null);
      setEditingService(null);
    } catch (err) {
      console.error('Error saving service:', err);
      // Revert optimistic update on error
      setLocalServices(services);
      updateContent({ ...contentData, services });
    }
  }, [localServices, contentData, updateContent, setShowModal, fetchData, services]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Services</h2>
        <button
          onClick={() => handleEdit()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>
      {loading && <p className="text-gray-600">Loading services...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localServices.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{service.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      )}
      {showModal === 'service' && (
        <ServiceModal
          data={editingService || undefined}
          onSave={handleSave}
          onClose={() => {
            setShowModal(null);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
};

export default ServicesSection;