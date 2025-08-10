import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Header } from '../../types';
import HeaderModal from '../modals/HeaderModal';

const API_URL = 'https://thriveenterprisesolutions.com.au/admin';

const HeaderManager: React.FC = () => {
  const [headers, setHeaders] = useState<Header[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Header>({
    logo_path: '',
    menu_items: [],
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // ✅ Fetch headers safely
  const fetchHeaders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/headers`);
      const fetchedData = res.data.data ?? res.data;

      const parsed = (Array.isArray(fetchedData) ? fetchedData : []).map(h => ({
        ...h,
        menu_items: Array.isArray(h.menu_items)
          ? h.menu_items
          : typeof h.menu_items === 'string'
          ? JSON.parse(h.menu_items)
          : [],
      }));

      setHeaders(parsed);
    } catch (error) {
      console.error('Error fetching headers:', error);
    }
  };

  useEffect(() => {
    fetchHeaders();
  }, []);

  const deleteHeader = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this header?')) return;
    try {
      await axios.delete(`${API_URL}/api/headers/${id}`);
      setHeaders(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('Error deleting header:', error);
    }
  };

  const openModal = (header?: Header) => {
    if (header) {
      setFormData(header);
      setEditingId(header.id ?? null);
    } else {
      setFormData({
        logo_path: '',
        menu_items: [],
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const saveHeader = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/headers/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/api/headers`, formData);
      }
      setShowModal(false);
      fetchHeaders();
    } catch (error) {
      console.error('Error saving header:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Headers</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New
        </button>
      </div>

      {headers.length === 0 ? (
        <div className="text-center py-4 text-gray-600">
          No headers found.{' '}
          <button
            onClick={() => openModal()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Add a new header
          </button>.
        </div>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-2 px-4 border-b">Logo Path</th>
              <th className="py-2 px-4 border-b">Menu Items</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {headers.map(header => (
              <tr key={header.id}>
                <td className="py-2 px-4 border-b">
                  {header.logo_path || 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {Array.isArray(header.menu_items)
                    ? header.menu_items.join(', ')
                    : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  <button
                    onClick={() => openModal(header)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteHeader(header.id!)}
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
      <HeaderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveHeader}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
      />
    </div>
  );
};

export default HeaderManager;
