import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ContentData, ContactSubmission } from '../App';
import { 
  Home, 
  Settings, 
  Users, 
  FileText, 
  MessageSquare, 
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Mail,
  Calendar,
  Eye,
  MoreVertical
} from 'lucide-react';
import HeroModal from './modals/HeroModal';
import ServiceModal from './modals/ServiceModal';
import TeamModal from './modals/TeamModal';
import AboutModal from './modals/AboutModal';
import ContactModal from './modals/ContactModal';
import ContactFormModal from './modals/ContactFormModal';

interface DashboardProps {
  contentData: ContentData;
  updateContent: (data: ContentData) => void;
  setIsAuthenticated: (auth: boolean) => void;
  contactSubmissions: ContactSubmission[];
  updateContactSubmissions: (submissions: ContactSubmission[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  contentData, 
  updateContent, 
  setIsAuthenticated, 
  contactSubmissions, 
  updateContactSubmissions 
}) => {
  const [activeTab, setActiveTab] = useState('hero');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<{ [key: string]: number }>({ services: 0, team: 0 });
  const maxRetries = 3;

  // Memoized fetch function to avoid redefinition
  const fetchData = useCallback(async (type: 'services' | 'team') => {
    const endpoint = type === 'services' ? 'services' : 'teams/list';
    if ((type === 'services' ? services.length : team.length) > 0 || retryCount[type] >= maxRetries) return;

    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/${endpoint}`, {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`, // Assuming authentication is required
        },
      });
      setLoading(false);
      if (type === 'services') {
        setServices(response.data);
        updateContent({ ...contentData, services: response.data });
      } else {
        // Ensure image URLs are absolute
        const updatedTeam = response.data.map((member: any) => ({
          ...member,
          image: member.image ? `http://127.0.0.1:8000/storage/${member.image}` : '',
        }));
        setTeam(updatedTeam);
        updateContent({ ...contentData, team: updatedTeam });
      }
      setError(null);
      setRetryCount(prev => ({ ...prev, [type]: 0 }));
    } catch (err: any) {
      setLoading(false);
      if (err.response?.status === 429 && retryCount[type] < maxRetries) {
        const delay = Math.pow(2, retryCount[type]) * 2000; // Increased delay: 2s, 4s, 8s
        console.log(`Rate limit hit for ${type}. Retrying in ${delay / 1000} seconds...`);
        setTimeout(() => {
          setRetryCount(prev => ({ ...prev, [type]: prev[type] + 1 }));
          fetchData(type);
        }, delay);
      } else {
        setError(`Failed to fetch ${type}: ${err.message}`);
        console.error(`Error fetching ${type}:`, err);
      }
    }
  }, [services.length, team.length, retryCount, contentData, updateContent]);

  // Fetch data when activeTab changes
  useEffect(() => {
    if (activeTab === 'services' || activeTab === 'team') {
      fetchData(activeTab);
    }
  }, [activeTab, fetchData]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('thriveAuth');
  };

  const handleEdit = (type: string, item?: any) => {
    setEditingItem(item);
    setShowModal(type);
  };

  const handleDelete = async (type: 'services' | 'team', id: string) => {
    try {
      if (type === 'services') {
        await axios.delete(`http://127.0.0.1:8000/api/services/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
        });
        setServices(services.filter(service => service.id !== id));
        updateContent({ ...contentData, services: services.filter(service => service.id !== id) });
      } else if (type === 'team') {
        await axios.delete(`http://127.0.0.1:8000/api/teams/${id}/delete`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
        });
        setTeam(team.filter(member => member.id !== id));
        updateContent({ ...contentData, team: team.filter(member => member.id !== id) });
      }
    } catch (err) {
      setError(`Failed to delete ${type.slice(0, -1)}`);
      console.error(`Error deleting ${type.slice(0, -1)}:`, err);
    }
  };

  const markAsRead = (id: string) => {
    const updatedSubmissions = contactSubmissions.map(sub =>
      sub.id === id ? { ...sub, status: 'read' as const } : sub
    );
    updateContactSubmissions(updatedSubmissions);
  };

  const deleteSubmission = (id: string) => {
    const updatedSubmissions = contactSubmissions.filter(sub => sub.id !== id);
    updateContactSubmissions(updatedSubmissions);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-green-100 text-green-800';
      case 'replied': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: Home },
    { id: 'services', name: 'Services', icon: Settings },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'about', name: 'About', icon: FileText },
    { id: 'contact', name: 'Contact', icon: MessageSquare },
    { id: 'contact-form', name: 'Contact Form', icon: Mail },
    { id: 'submissions', name: 'Form Submissions', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <nav className="mt-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          {activeTab === 'hero' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Hero Section</h2>
                <button
                  onClick={() => handleEdit('hero')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{contentData.hero.title}</h3>
                  <p className="text-gray-600 mb-4">{contentData.hero.subtitle}</p>
                  <p className="text-gray-700">{contentData.hero.description}</p>
                </div>
                <div>
                  <img 
                    src={contentData.hero.image} 
                    alt="Hero" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Services Section */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Services</h2>
                <button
                  onClick={() => handleEdit('service')}
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
                  {(services ?? []).map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">{service.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit('service', service)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete('services', service.id)}
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
            </div>
          )}

          {/* Team Section */}
          {activeTab === 'team' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Team Members</h2>
                <button
                  onClick={() => handleEdit('team')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>
              {loading && <p>Loading team members...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {!loading && !error && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(team ?? []).map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-6 text-center">
                      <div className="flex justify-end space-x-2 mb-4">
                        <button
                          onClick={() => handleEdit('team', member)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('team', member.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          console.error(`Failed to load image for ${member.name}`);
                        }}
                      />
                      <h3 className="font-semibold mb-1">{member.name}</h3>
                      <p className="text-blue-600 text-sm mb-2">{member.position}</p>
                      {member.social_links && (
                        <div className="flex justify-center space-x-3">
                          {member.social_links.twitter && (
                            <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                              Twitter
                            </a>
                          )}
                          {member.social_links.linkedin && (
                            <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                              LinkedIn
                            </a>
                          )}
                          {member.social_links.facebook && (
                            <a href={member.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                              Facebook
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About Section */}
          {activeTab === 'about' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">About Information</h2>
                <button
                  onClick={() => handleEdit('about')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{contentData.about.title}</h3>
                  <p className="text-gray-700">{contentData.about.description}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-600 mb-2">Mission</h4>
                    <p className="text-gray-700">{contentData.about.mission}</p>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-lg">
                    <h4 className="font-semibold text-emerald-600 mb-2">Vision</h4>
                    <p className="text-gray-700">{contentData.about.vision}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Contact Information</h2>
                <button
                  onClick={() => handleEdit('contact')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-gray-700">{contentData.contact.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-gray-700">{contentData.contact.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Address</h4>
                    <p className="text-gray-700">{contentData.contact.address}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Business Hours</h4>
                    <p className="text-gray-700">{contentData.contact.hours}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Form Settings */}
          {activeTab === 'contact-form' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Contact Form Settings</h2>
                <button
                  onClick={() => handleEdit('contact-form')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Form Title</h4>
                  <p className="text-gray-700">{contentData.contactForm.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Form Subtitle</h4>
                  <p className="text-gray-700">{contentData.contactForm.subtitle}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Success Message</h4>
                  <p className="text-gray-700">{contentData.contactForm.successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Submissions */}
          {activeTab === 'submissions' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Contact Form Submissions</h2>
                  <p className="text-gray-600 mt-1">
                    {contactSubmissions.length} total submissions
                    {contactSubmissions.filter(s => s.status === 'new').length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {contactSubmissions.filter(s => s.status === 'new').length} new
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {contactSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-500">Contact form submissions will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`border rounded-lg p-6 transition-all hover:shadow-md ${
                        submission.status === 'new' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {submission.firstName} {submission.lastName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{submission.email}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(submission.submittedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {submission.status === 'new' && (
                            <button
                              onClick={() => markAsRead(submission.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSubmission(submission.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Message:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal === 'hero' && (
        <HeroModal
          data={contentData.hero}
          onSave={(data) => {
            updateContent({ ...contentData, hero: data });
            setShowModal(null);
          }}
          onClose={() => setShowModal(null)}
        />
      )}

      {showModal === 'service' && (
        <ServiceModal
          data={editingItem}
          onSave={async (data) => {
            try {
              let updatedServices;
              if (editingItem) {
                await axios.put(`http://127.0.0.1:8000/api/services/${editingItem.id}`, data, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
                });
                updatedServices = services.map(s => s.id === editingItem.id ? data : s);
              } else {
                const response = await axios.post('http://127.0.0.1:8000/api/services', data, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
                });
                updatedServices = [...services, { ...response.data, id: response.data.id }];
              }
              setServices(updatedServices);
              updateContent({ ...contentData, services: updatedServices });
            } catch (err) {
              setError('Failed to save service');
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

      {showModal === 'team' && (
        <TeamModal
          data={editingItem ? { ...editingItem, image: editingItem.image.replace('http://127.0.0.1:8000/storage/', '') } : null}
          onSave={async (data) => {
            try {
              let updatedTeam;
              let response;
              if (editingItem) {
                // Update existing team member
                response = await axios.post(`http://127.0.0.1:8000/api/teams/${editingItem.id}/update`, {
                  name: data.name,
                  position: data.position,
                  image: data.image instanceof File ? data.image : null,
                  social_links: data.social_links ? {
                    twitter: data.social_links.twitter || '',
                    linkedin: data.social_links.linkedin || '',
                    facebook: data.social_links.facebook || '',
                  } : {},
                }, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
                  },
                });
                updatedTeam = team.map(t => t.id === editingItem.id ? { ...response.data, image: `http://127.0.0.1:8000/storage/${response.data.image}` } : t);
              } else {
                // Create new team member
                const formData = new FormData();
                formData.append('name', data.name);
                formData.append('position', data.position);
                formData.append('image', data.image as File);
                if (data.social_links) {
                  const socialLinksArray = [];
                  if (data.social_links.twitter && data.social_links.twitter.trim()) {
                    socialLinksArray.push({ key: 'twitter', value: data.social_links.twitter.trim() });
                  }
                  if (data.social_links.linkedin && data.social_links.linkedin.trim()) {
                    socialLinksArray.push({ key: 'linkedin', value: data.social_links.linkedin.trim() });
                  }
                  if (data.social_links.facebook && data.social_links.facebook.trim()) {
                    socialLinksArray.push({ key: 'facebook', value: data.social_links.facebook.trim() });
                  }
                  socialLinksArray.forEach((link, index) => {
                    formData.append(`social_links[${index}][key]`, link.key);
                    formData.append(`social_links[${index}][value]`, link.value);
                  });
                }
                response = await axios.post('http://127.0.0.1:8000/api/teams/create', formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
                  },
                });
                updatedTeam = [...team, { ...response.data, image: `http://127.0.0.1:8000/storage/${response.data.image}` }];
              }
              setTeam(updatedTeam);
              updateContent({ ...contentData, team: updatedTeam });
            } catch (err) {
              setError('Failed to save team member');
              console.error('Error saving team member:', err);
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

      {showModal === 'about' && (
        <AboutModal
          data={contentData.about}
          onSave={(data) => {
            updateContent({ ...contentData, about: data });
            setShowModal(null);
          }}
          onClose={() => setShowModal(null)}
        />
      )}

      {showModal === 'contact' && (
        <ContactModal
          data={contentData.contact}
          onSave={(data) => {
            updateContent({ ...contentData, contact: data });
            setShowModal(null);
          }}
          onClose={() => setShowModal(null)}
        />
      )}

      {showModal === 'contact-form' && (
        <ContactFormModal
          data={contentData.contactForm}
          onSave={(data) => {
            updateContent({ ...contentData, contactForm: data });
            setShowModal(null);
          }}
          onClose={() => setShowModal(null)}
        />
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Submission Details</h2>
              <button 
                onClick={() => setSelectedSubmission(null)} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <p className="text-gray-900">{selectedSubmission.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <p className="text-gray-900">{selectedSubmission.lastName}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{selectedSubmission.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                <p className="text-gray-900">{formatDate(selectedSubmission.submittedAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: Your inquiry&body=Hi ${selectedSubmission.firstName},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0ABest regards,%0D%0AThrive Enterprise Solutions`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;