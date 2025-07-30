import React from 'react';
import { X, Mail } from 'lucide-react';
import { ContactSubmission } from '../../types';

interface SubmissionModalProps {
  submission: ContactSubmission;
  onClose: () => void;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({ submission, onClose, formatDate, getStatusColor }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Submission Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <p className="text-gray-900">{submission.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <p className="text-gray-900">{submission.lastName}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{submission.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
            <p className="text-gray-900">{formatDate(submission.submittedAt)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
              {submission.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{submission.message}</p>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <a
              href={`mailto:${submission.email}?subject=Re: Your inquiry&body=Hi ${submission.firstName},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0ABest regards,%0D%0AThrive Enterprise Solutions`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Reply via Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;