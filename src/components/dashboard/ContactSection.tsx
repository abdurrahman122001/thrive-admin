import React, { useEffect, useState } from 'react';
import { Edit3 } from 'lucide-react';
import ContactModal from '../modals/ContactModal';
import axios from 'axios';

interface ContactData {
  id?: number;
  phone: string;
  email: string;
  address: string;
  business_hours: string;
  facebook: string;
  twitter: string;
  instagram: string;
  pinterest: string;
  linkedin: string;
}

const ContactSection: React.FC = () => {
  const [contactData, setContactData] = useState<ContactData>({
    phone: '',
    email: '',
    address: '',
    business_hours: '',
    facebook: '',
    twitter: '',
    instagram: '',
    pinterest: '',
    linkedin: ''
  });
  const [showModal, setShowModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://thriveenterprisesolutions.com.au/admin';

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/contact`);
        setContactData(response.data);
      } catch (err) {
        console.error('Error fetching contact data:', err);
        setError('Failed to load contact information');
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const handleSave = async (data: ContactData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (data.id) {
        await axios.put(`${API_URL}/api/contact/${data.id}`, data);
      } else {
        await axios.post(`${API_URL}/api/contact`, data);
      }

      const response = await axios.get(`${API_URL}/api/contact`);
      setContactData(response.data);
      setShowModal(null);
    } catch (err) {
      console.error('Error saving contact data:', err);
      setError('Failed to save contact information');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !contactData.phone) {
    return <div className="p-8 text-center">Loading contact information...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Contact Information</h2>
        <button
          onClick={() => setShowModal('contact')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          disabled={loading}
        >
          <Edit3 className="w-4 h-4" />
          <span>{loading ? 'Processing...' : 'Edit'}</span>
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Phone</h4>
            <p className="text-gray-700">{contactData.phone || 'Not provided'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Email</h4>
            <p className="text-gray-700">{contactData.email || 'Not provided'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Social Links</h4>
            <div className="flex space-x-4">
              {contactData.facebook && (
                <a href={contactData.facebook} target="_blank" rel="noopener noreferrer">
                  <i className="bx bxl-facebook text-2xl text-blue-600 hover:text-blue-800"></i>
                </a>
              )}
              {contactData.twitter && (
                <a href={contactData.twitter} target="_blank" rel="noopener noreferrer">
                  <i className="bx bxl-twitter text-2xl text-blue-400 hover:text-blue-600"></i>
                </a>
              )}
              {contactData.instagram && (
                <a href={contactData.instagram} target="_blank" rel="noopener noreferrer">
                  <i className="bx bxl-instagram text-2xl text-pink-600 hover:text-pink-800"></i>
                </a>
              )}
              {contactData.pinterest && (
                <a href={contactData.pinterest} target="_blank" rel="noopener noreferrer">
                  <i className="bx bxl-pinterest text-2xl text-red-600 hover:text-red-800"></i>
                </a>
              )}
              {contactData.linkedin && (
                <a href={contactData.linkedin} target="_blank" rel="noopener noreferrer">
                  <i className="bx bxl-linkedin text-2xl text-blue-700 hover:text-blue-900"></i>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Address</h4>
            <p className="text-gray-700">{contactData.address || 'Not provided'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Business Hours</h4>
            <p className="text-gray-700">{contactData.business_hours || 'Not provided'}</p>
          </div>
        </div>
      </div>
      {showModal === 'contact' && (
        <ContactModal
          data={contactData}
          onSave={handleSave}
          onClose={() => setShowModal(null)}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default ContactSection;