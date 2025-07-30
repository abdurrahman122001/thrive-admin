import React from 'react';
import { Edit3 } from 'lucide-react';
import { ContentData } from '../../types';
import ContactModal from '../modals/ContactModal';

interface ContactSectionProps {
  contentData: ContentData;
  updateContent: (data: ContentData) => void;
  showModal: string | null;
  setShowModal: (modal: string | null) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ contentData, updateContent, showModal, setShowModal }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Contact Information</h2>
        <button
          onClick={() => setShowModal('contact')}
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
    </div>
  );
};

export default ContactSection;