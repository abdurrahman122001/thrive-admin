import React from 'react';
import { Edit3 } from 'lucide-react';
import { ContentData } from '../../types';
import ContactFormModal from '../modals/ContactFormModal';

interface ContactFormSectionProps {
  contentData: ContentData;
  updateContent: (data: ContentData) => void;
  showModal: string | null;
  setShowModal: (modal: string | null) => void;
}
const API_URL = import.meta.env.API_URL || "http://thriveenterprisesolutions.com.au/admin";
const ContactFormSection: React.FC<ContactFormSectionProps> = ({ contentData, updateContent, showModal, setShowModal }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Contact Form Settings</h2>
        <button
          onClick={() => setShowModal('contact-form')}
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
    </div>
  );
};

export default ContactFormSection;