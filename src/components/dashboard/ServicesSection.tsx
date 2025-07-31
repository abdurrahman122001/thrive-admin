import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Plus, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import ServiceModal from "../modals/ServiceModal";
import { useApiFetch } from "./useApiFetch";

interface Service {
  id: string;
  title: string;
  short_description: string;
  long_description: string;
  created_at?: string;
  updated_at?: string;
}

interface ServicesSectionProps {
  contentData: any;
  updateContent: (data: any) => void;
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
  const {
    data: services,
    loading,
    error,
    fetchData,
  } = useApiFetch<Service>("services", [], contentData, updateContent);
  const [localServices, setLocalServices] = useState<Service[]>(services);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 3;

  useEffect(() => {
    console.log("Services data:", services);
    setLocalServices(services);
    // Reset to first page when services change
    setCurrentPage(1);
  }, [services]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = localServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(localServices.length / servicesPerPage);

  const handleEdit = useCallback(
    (service?: Service) => {
      setEditingService(
        service || {
          id: "",
          title: "",
          short_description: "",
          long_description: "",
        }
      );
      setShowModal("service");
    },
    [setShowModal]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const updatedServices = localServices.filter(s => s.id !== id);
        setLocalServices(updatedServices);
        updateContent({ ...contentData, services: updatedServices });

        await axios.delete(`${API_URL}/api/services/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("thriveAuth") || ""}`,
          },
        });

        await fetchData();
        
        // Adjust current page if we deleted the last item on the current page
        if (currentServices.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error("Error deleting service:", err);
        setLocalServices(services);
        updateContent({ ...contentData, services });
      }
    },
    [localServices, contentData, updateContent, fetchData, services, currentPage, currentServices]
  );

  const handleSave = useCallback(
    async (data: Service) => {
      try {
        let updatedServices;
        let response;

        if (data.id) {
          // Update existing
          updatedServices = localServices.map(s => 
            s.id === data.id ? { ...s, ...data } : s
          );
          setLocalServices(updatedServices);
          updateContent({ ...contentData, services: updatedServices });

          response = await axios.put(
            `${API_URL}/api/services/${data.id}`,
            data,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("thriveAuth") || ""}`,
              },
            }
          );
          updatedServices = localServices.map(s => 
            s.id === data.id ? response.data : s
          );
        } else {
          // Create new
          const tempId = `temp-${Date.now()}`;
          updatedServices = [...localServices, { ...data, id: tempId }];
          setLocalServices(updatedServices);
          updateContent({ ...contentData, services: updatedServices });

          response = await axios.post(`${API_URL}/api/services`, data, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("thriveAuth") || ""}`,
            },
          });
          updatedServices = localServices.map(s => 
            s.id === tempId ? response.data : s
          );
          
          // Move to last page when adding a new service
          const newTotalPages = Math.ceil(updatedServices.length / servicesPerPage);
          setCurrentPage(newTotalPages);
        }

        setLocalServices(updatedServices);
        updateContent({ ...contentData, services: updatedServices });
        await fetchData();
        setShowModal(null);
        setEditingService(null);
      } catch (err) {
        console.error("Error saving service:", err);
        setLocalServices(services);
        updateContent({ ...contentData, services });
      }
    },
    [localServices, contentData, updateContent, setShowModal, fetchData, services, servicesPerPage]
  );

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Services</h2>
          {!loading && !error && localServices.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {(currentPage - 1) * servicesPerPage + 1}-
              {Math.min(currentPage * servicesPerPage, localServices.length)} of {localServices.length} services
            </p>
          )}
        </div>
        <button
          onClick={() => handleEdit()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading services...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentServices.map((service) => (
              <div
                key={service.id}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {service.title}
                  </h3>
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
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {service.short_description || "No short description"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Details
                    </h4>
                    <div
                      className="text-gray-600 text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: service.long_description || "<p>No details available</p>",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {localServices.length > servicesPerPage && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md border border-gray-300 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 border-t border-b border-gray-300 ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-md border border-gray-300 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {showModal === "service" && (
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