import React, { useState, useEffect } from 'react';
import { Edit3, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import SiteSettingModal from '../modals/SiteSettingModal';
import ConfirmModal from '../modals/ConfirmModal';
import { SiteSetting } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const SiteSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [activeSetting, setActiveSetting] = useState<SiteSetting | null>(null);
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [currentSetting, setCurrentSetting] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noSettingsExist, setNoSettingsExist] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoSettingsExist(false);

      const [settingsRes, activeRes] = await Promise.all([
        fetch(`${API_URL}/site-settings`),
        fetch(`${API_URL}/site-settings/active`)
      ]);

      const settingsData = await settingsRes.json();
      setSettings(settingsData || []);

      if (activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveSetting(activeData);
      } else if (activeRes.status === 404) {
        setNoSettingsExist(true);
      } else {
        const errData = await activeRes.json();
        throw new Error(errData.message || 'Failed to fetch active settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: FormData) => {
    try {
      // Set is_active to true if this is the first setting
      if (settings.length === 0) {
        formData.append('is_active', 'true');
      }

      const response = await fetch(`${API_URL}/site-settings`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create setting");
      }

      await fetchSettings();
      setShowModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create setting");
    }
  };

  const handleUpdate = async (id: number, formData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/site-settings/${id}`, {
        method: 'POST', // Using POST for file upload with _method=PUT
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update setting');
      }

      await fetchSettings();
      setShowModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/site-settings/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete setting');
      }

      await fetchSettings();
      setShowModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete setting');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/site-settings/${id}/activate`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to activate setting');
      }

      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate setting');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Site Settings Management</h2>
        <button
          onClick={() => {
            setCurrentSetting(null);
            setShowModal('create');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </button>
      </div>

      {noSettingsExist && settings.length === 0 && (
        <div className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-800">No Navigation Settings Found</h3>
          </div>
          <p className="mt-2 text-yellow-700">
            There are currently no navigation settings configured. Click the "Create New" button to add your first set of navigation settings.
          </p>
        </div>
      )}

      {activeSetting ? (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">Active Settings</h3>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(activeSetting.updated_at!).toLocaleDateString()}
              </p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">Logo</h4>
            <img src={activeSetting.logo_url} alt="Site Logo" className="h-16" />
          </div>
          <div>
            <h4 className="text-lg font-medium mb-2">Menu Items</h4>
            <ul className="list-disc pl-5">
              {activeSetting.menu_items.map((item, index) => (
                <li key={index}>
                  {item.label}: <a href={item.url} className="text-blue-600">{item.url}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : settings.length > 0 && (
        <div className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-800">No Active Settings</h3>
          </div>
          <p className="mt-2 text-yellow-700">
            You have navigation settings but none are marked as active. Please activate one of your settings.
          </p>
        </div>
      )}

      {settings.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">All Settings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settings.map((setting) => (
                  <tr key={setting.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{setting.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={setting.logo_url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {setting.logo_url}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <ul className="list-disc pl-5">
                        {setting.menu_items.map((item, index) => (
                          <li key={index} className="mb-1 last:mb-0">
                            <span className="font-medium">{item.label}:</span> {item.url}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(setting.updated_at!).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {setting.is_active ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(setting.id!)}
                          className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          Set Active
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          setCurrentSetting(setting);
                          setShowModal('edit');
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!setting.is_active && (
                        <button
                          onClick={() => {
                            setCurrentSetting(setting);
                            setShowModal('delete');
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
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
      )}

      {(showModal === 'create' || showModal === 'edit') && (
        <SiteSettingModal
          setting={currentSetting}
          onSave={(formData) => {
            if (showModal === 'create') {
              handleCreate(formData);
            } else if (currentSetting?.id) {
              const formDataWithMethod = new FormData();
              formDataWithMethod.append('_method', 'PUT');
              Array.from(formData.entries()).forEach(([key, value]) => {
                formDataWithMethod.append(key, value);
              });
              handleUpdate(currentSetting.id, formDataWithMethod);
            }
          }}
          onClose={() => setShowModal(null)}
        />
      )}

      {showModal === 'delete' && currentSetting && (
        <ConfirmModal
          title="Delete Site Settings"
          message={`Are you sure you want to delete settings with ID ${currentSetting.id}?`}
          onConfirm={() => handleDelete(currentSetting.id!)}
          onCancel={() => setShowModal(null)}
        />
      )}
    </div>
  );
};

export default SiteSettingsSection;