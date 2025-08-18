import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Disclaimer } from '../../types';
import DisclaimerModal from '../modals/DisclaimerModal';
import { Plus, Edit3, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "https://thriveenterprisesolutions.com.au/admin/api";


const DisclaimerManager: React.FC = () => {
  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Disclaimer>({
    title: '',
    content: '',
    status: 'inactive',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch disclaimers
  const fetchDisclaimers = async () => {
    try {
      const res = await axios.get(`${API_URL}/disclaimers`);
      setDisclaimers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDisclaimers();
  }, []);

  // Delete disclaimer
  const deleteDisclaimer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this disclaimer?')) return;
    try {
      await axios.delete(`${API_URL}/disclaimers/${id}`);
      setDisclaimers(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Open modal
  const openModal = (disclaimer?: Disclaimer) => {
    if (disclaimer) {
      setFormData(disclaimer);
      setEditingId(disclaimer.id ?? null);
    } else {
      setFormData({
        title: '',
        content: '',
        status: 'inactive',
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  // Save disclaimer
  const saveDisclaimer = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/disclaimers/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/disclaimers`, formData);
      }
      setShowModal(false);
      fetchDisclaimers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Disclaimers</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New
        </button>
      </div>

      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {disclaimers.length > 0 ? (
            disclaimers.map(disclaimer => (
              <tr key={disclaimer.id}>
                <td className="py-2 px-4 border-b">{disclaimer.title}</td>
                <td className="py-2 px-4 border-b capitalize">{disclaimer.status}</td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  <button
                    onClick={() => openModal(disclaimer)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDisclaimer(disclaimer.id!)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="py-4 px-4 border-b text-center" colSpan={3}>
                No disclaimers found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      <DisclaimerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveDisclaimer}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
      />
    </div>
  );
};

export default DisclaimerManager;
