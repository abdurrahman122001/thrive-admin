import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Calendar, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { ContactSubmission } from '../../types';
import SubmissionModal from '../modals/SubmissionModal';

interface SubmissionsSectionProps {
  contactSubmissions: ContactSubmission[];
  updateContactSubmissions: (submissions: ContactSubmission[]) => void;
  selectedSubmission: ContactSubmission | null;
  setSelectedSubmission: (submission: ContactSubmission | null) => void;
}

const SubmissionsSection: React.FC<SubmissionsSectionProps> = ({
  contactSubmissions,
  updateContactSubmissions,
  selectedSubmission,
  setSelectedSubmission,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'https://thriveenterprisesolutions.com.au/admin';

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/contact-submissions`);
      updateContactSubmissions(response.data);
      setError(null);
    } catch (err: any) {
      setError(`Failed to fetch submissions: ${err.message}`);
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/contact-submissions/${id}`,
        { status: 'read' }
      );
      const updatedSubmissions = contactSubmissions.map(sub =>
        sub.id === id ? response.data.data : sub
      );
      updateContactSubmissions(updatedSubmissions);
    } catch (err) {
      console.error('Error marking submission as read:', err);
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/contact-submissions/${id}`);
      const updatedSubmissions = contactSubmissions.filter(sub => sub.id !== id);
      updateContactSubmissions(updatedSubmissions);
    } catch (err) {
      console.error('Error deleting submission:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'replied':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
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
      {loading && <p>Loading submissions...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && contactSubmissions.length === 0 ? (
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
              className={`border rounded-lg p-6 transition-all hover:shadow-md ${submission.status === 'new' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {submission.first_name} {submission.last_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{submission.email}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(submission.created_at)}</span>
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
      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

export default SubmissionsSection;
