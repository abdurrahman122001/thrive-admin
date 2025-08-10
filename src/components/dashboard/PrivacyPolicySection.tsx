import React, { useState, useEffect } from 'react';
import { Edit3, Plus, Trash2, Check } from 'lucide-react';
import PrivacyPolicyModal from '../modals/PrivacyPolicyModal';
import ConfirmModal from '../modals/ConfirmModal';
import { PrivacyPolicy } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || "https://thriveenterprisesolutions.com.au/admin/api";

const PrivacyPolicySection: React.FC = () => {
  const [policies, setPolicies] = useState<PrivacyPolicy[]>([]);
  const [activePolicy, setActivePolicy] = useState<PrivacyPolicy | null>(null);
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [currentPolicy, setCurrentPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const [policiesRes, activeRes] = await Promise.all([
        fetch(`${API_URL}/privacy-policies`),
        fetch(`${API_URL}/privacy-policies/active`)
      ]);
      
      const policiesData = await policiesRes.json();
      const activeData = await activeRes.json();
      
      if (policiesData.success && activeData.success) {
        setPolicies(policiesData.data);
        setActivePolicy(activeData.data);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: PrivacyPolicy) => {
    try {
      const response = await fetch(`${API_URL}/privacy-policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchPolicies();
        setShowModal(null);
      } else {
        throw new Error(data.message || 'Failed to create policy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create policy');
    }
  };

  const handleUpdate = async (id: number, formData: PrivacyPolicy) => {
    try {
      const response = await fetch(`${API_URL}/privacy-policies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchPolicies();
        setShowModal(null);
      } else {
        throw new Error(data.message || 'Failed to update policy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update policy');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/privacy-policies/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchPolicies();
        setShowModal(null);
      } else {
        throw new Error(data.message || 'Failed to delete policy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete policy');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/privacy-policies/${id}/activate`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchPolicies();
      } else {
        throw new Error(data.message || 'Failed to activate policy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate policy');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Privacy Policy Management</h2>
        <button
          onClick={() => {
            setCurrentPolicy(null);
            setShowModal('create');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </button>
      </div>

      {activePolicy && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">Active Policy</h3>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(activePolicy.last_updated).toLocaleDateString()}
              </p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <h4 className="text-lg font-medium mb-2">{activePolicy.title}</h4>
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: activePolicy.content }} 
          />
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">All Policies</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{policy.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">
                      {new Date(policy.last_updated).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {policy.is_active ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivate(policy.id!)}
                        className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full hover:bg-gray-200"
                      >
                        Set Active
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        setCurrentPolicy(policy);
                        setShowModal('edit');
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!policy.is_active && (
                      <button
                        onClick={() => {
                          setCurrentPolicy(policy);
                          setShowModal('delete');
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showModal === 'create' || showModal === 'edit') && (
        <PrivacyPolicyModal
          policy={currentPolicy}
          onSave={(formData) => {
            if (showModal === 'create') {
              handleCreate(formData);
            } else if (currentPolicy?.id) {
              handleUpdate(currentPolicy.id, formData);
            }
          }}
          onClose={() => setShowModal(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showModal === 'delete' && currentPolicy && (
        <ConfirmModal
          title="Delete Privacy Policy"
          message={`Are you sure you want to delete "${currentPolicy.title}"?`}
          onConfirm={() => handleDelete(currentPolicy.id!)}
          onCancel={() => setShowModal(null)}
        />
      )}
    </div>
  );
};

export default PrivacyPolicySection;