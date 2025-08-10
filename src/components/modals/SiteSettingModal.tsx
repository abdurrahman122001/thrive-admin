import React, { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { SiteSetting } from "../../types";

interface SiteSettingModalProps {
  setting: SiteSetting | null;
  onSave: (formData: FormData) => void;
  onClose: () => void;
}

const SiteSettingModal: React.FC<SiteSettingModalProps> = ({
  setting,
  onSave,
  onClose,
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [menuItems, setMenuItems] = useState<{ label: string; url: string }[]>(
    setting?.menu_items || [{ label: "", url: "" }]
  );

  const handleMenuItemChange = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    
    if (logoFile) {
      formData.append('logo_file', logoFile);
    } else if (!setting && !logoFile) {
      alert('Logo file is required');
      return;
    }
    
    menuItems.forEach((item, index) => {
      formData.append(`menu_items[${index}][label]`, item.label);
      formData.append(`menu_items[${index}][url]`, item.url);
    });

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">
              {setting ? "Edit Settings" : "Create Settings"}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Logo Upload - REQUIRED for create, optional for edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo {!setting && '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required={!setting}
                />
                {setting && !logoFile && (
                  <p className="mt-1 text-sm text-gray-500">Current logo will be kept if no file is selected</p>
                )}
              </div>

              {/* Menu Items - REQUIRED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Items *
                </label>
                {menuItems.map((item, index) => (
                  <div key={index} className="mb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleMenuItemChange(index, 'label', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Menu label"
                        required
                      />
                      {menuItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMenuItems(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleMenuItemChange(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Menu URL"
                      required
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMenuItems(prev => [...prev, { label: "", url: "" }])}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Menu Item
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {setting ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingModal;