import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { FooterData } from '../../types';

interface FooterSectionProps {
    contentData: any;
    updateContent: (data: any) => void;
    showModal: string | null;
    setShowModal: (modal: string | null) => void;
}
const API_URL = import.meta.env.API_URL || "http://thriveenterprisesolutions.com.au/admin";

const FooterSection: React.FC<FooterSectionProps> = ({
    contentData,
    updateContent,
    showModal,
    setShowModal,
}) => {
    const [footers, setFooters] = useState<FooterData[]>([]);
    const [editingFooter, setEditingFooter] = useState<FooterData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchFooters();
    }, []);

    const fetchFooters = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/footers`);
            setFooters(response.data);
        } catch (err) {
            setError('Failed to load footer data');
            console.error(err);
        }
    };

    const handleEdit = (footer?: FooterData) => {
        setEditingFooter(footer || {
            title: 'THRIVE',
            description: 'ENTERPRISE SOLUTIONS',
            privacy_link: '',
            terms_link: '',
            disclaimer_link: '',
            copyright_text: 'Copyright Thrive Enterprise 2025. All rights Reserved',
            designer_text: 'Designed By Tensorer Solution',
            logo: '',
            facebook_url: '',
            twitter_url: '',
            instagram_url: '',
            pinterest_url: '',
            linkedin_url: ''
        });

        if (footer?.logo) {
            setLogoPreview(footer.logo.startsWith('http') ? footer.logo : `http://thriveenterprisesolutions.com.au/admin/${footer.logo}`);
        } else {
            setLogoPreview(null);
        }

        setShowModal('footer');
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/footers/${id}`);
            setFooters(footers.filter(f => f.id !== id));
        } catch (err) {
            setError('Failed to delete footer');
            console.error(err);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };

            reader.readAsDataURL(file);

            if (editingFooter) {
                setEditingFooter({
                    ...editingFooter,
                    logo: file
                });
            }
        }
    };

    const handleSave = async (data: FooterData) => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Append all fields to formData
            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'id' && value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            let response;

            if (data.id) {
                // For update, use PUT method
                formData.append('_method', 'PUT');
                response = await axios.post(
                    `${API_URL}/api/footers/${data.id}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            } else {
                // For create, use POST method
                response = await axios.post(
                    `${API_URL}/api/footers`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            }

            if (data.id) {
                setFooters(footers.map(f => f.id === data.id ? response.data : f));
            } else {
                setFooters([...footers, response.data]);
            }

            setShowModal(null);
            setEditingFooter(null);
            setLogoPreview(null);
        } catch (err) {
            setError('Failed to save footer');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Footer Content</h2>
                <button
                    onClick={() => handleEdit()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Footer</span>
                </button>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {footers.map((footer) => (
                    <div key={footer.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{footer.title || 'Footer Content'}</h3>
                                {footer.logo && (
                                    <img
                                        src={footer.logo.startsWith('http') ? footer.logo : `http://thriveenterprisesolutions.com.au/admin/${footer.logo}`}
                                        alt="Footer Logo"
                                        className="h-12 mt-2 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(footer)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => footer.id && handleDelete(footer.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{footer.description || 'No description'}</p>
                        <div className="space-y-1">
                            <div className="text-xs text-gray-500 flex items-center space-x-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <span>Copyright: {footer.copyright_text}</span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center space-x-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <span>Designer: {footer.designer_text}</span>
                            </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                            {footer.facebook_url && (
                                <a href={footer.facebook_url} target="_blank" rel="noopener noreferrer">
                                    <i className="bx bxl-facebook text-blue-600"></i>
                                </a>
                            )}
                            {footer.twitter_url && (
                                <a href={footer.twitter_url} target="_blank" rel="noopener noreferrer">
                                    <i className="bx bxl-twitter text-blue-400"></i>
                                </a>
                            )}
                            {footer.instagram_url && (
                                <a href={footer.instagram_url} target="_blank" rel="noopener noreferrer">
                                    <i className="bx bxl-instagram text-pink-600"></i>
                                </a>
                            )}
                            {footer.pinterest_url && (
                                <a href={footer.pinterest_url} target="_blank" rel="noopener noreferrer">
                                    <i className="bx bxl-pinterest text-red-600"></i>
                                </a>
                            )}
                            {footer.linkedin_url && (
                                <a href={footer.linkedin_url} target="_blank" rel="noopener noreferrer">
                                    <i className="bx bxl-linkedin text-blue-700"></i>
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showModal === 'footer' && editingFooter && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold">{editingFooter.id ? 'Edit Footer' : 'Add Footer'}</h2>
                            <button
                                onClick={() => {
                                    setShowModal(null);
                                    setEditingFooter(null);
                                    setLogoPreview(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave(editingFooter);
                            }}
                            className="p-6 space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editingFooter.title || ''}
                                    onChange={(e) => setEditingFooter({ ...editingFooter, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={editingFooter.description || ''}
                                    onChange={(e) => setEditingFooter({ ...editingFooter, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {logoPreview && (
                                    <div className="mt-3">
                                        <img
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            className="h-20 object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Link</label>
                                    <input
                                        type="url"
                                        value={editingFooter.privacy_link || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, privacy_link: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms Link</label>
                                    <input
                                        type="url"
                                        value={editingFooter.terms_link || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, terms_link: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Disclaimer Link</label>
                                    <input
                                        type="url"
                                        value={editingFooter.disclaimer_link || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, disclaimer_link: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                                    <input
                                        type="url"
                                        value={editingFooter.facebook_url || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, facebook_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                                    <input
                                        type="url"
                                        value={editingFooter.twitter_url || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, twitter_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                                    <input
                                        type="url"
                                        value={editingFooter.instagram_url || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, instagram_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pinterest URL</label>
                                    <input
                                        type="url"
                                        value={editingFooter.pinterest_url || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, pinterest_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        value={editingFooter.linkedin_url || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, linkedin_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text *</label>
                                    <input
                                        type="text"
                                        value={editingFooter.copyright_text || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, copyright_text: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Designer Text</label>
                                    <input
                                        type="text"
                                        value={editingFooter.designer_text || ''}
                                        onChange={(e) => setEditingFooter({ ...editingFooter, designer_text: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(null);
                                        setEditingFooter(null);
                                        setLogoPreview(null);
                                    }}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                    disabled={loading}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FooterSection;