import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Term } from '../../types';
import TermModal from '../modals/TermModal';

const API_URL = import.meta.env.VITE_API_URL || "https://thriveenterprisesolutions.com.au/admin/api";

const TermsManager: React.FC = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Term>({
    id: undefined,
    title: '',
    content: '',
    status: 'inactive',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch terms
  const fetchTerms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/terms-conditions`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setTerms(data);
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  // Delete term
  const deleteTerm = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this term?')) return;
    try {
      await axios.delete(`${API_URL}/terms-conditions/${id}`);
      setTerms(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Open modal
  const openModal = (term?: Term) => {
    if (term) {
      setFormData({ ...term });
      setEditingId(term.id ?? null);
    } else {
      setFormData({ id: undefined, title: '', content: '', status: 'inactive' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  // Save term
  const saveTerm = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/terms-conditions/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/terms-conditions`, formData);
      }
      setShowModal(false);
      fetchTerms();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Terms & Conditions</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : terms.length === 0 ? (
        <p className="text-gray-500">No terms found.</p>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.map(term => (
              <tr key={term.id}>
                <td className="py-2 px-4 border-b">{term.title}</td>
                <td className="py-2 px-4 border-b capitalize">{term.status}</td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  <button
                    onClick={() => openModal(term)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTerm(term.id!)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <TermModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveTerm}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
      />
    </div>
  );
};

export default TermsManager;
