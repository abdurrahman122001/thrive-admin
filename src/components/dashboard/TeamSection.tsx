import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { ContentData, TeamMember } from '../../types';
import TeamModal from '../modals/TeamModal';
import { useApiFetch } from './useApiFetch';

interface TeamSectionProps {
  contentData: ContentData;
  updateContent: (data: ContentData) => void;
  showModal: string | null;
  setShowModal: (modal: string | null) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://thriveenterprisesolutions.com.au/admin';

const TeamSection: React.FC<TeamSectionProps> = ({
  contentData,
  updateContent,
  showModal,
  setShowModal,
}) => {
  const { data: team, loading, error, fetchData } = useApiFetch<TeamMember>('team', [], contentData, updateContent);
  const [localTeam, setLocalTeam] = useState<TeamMember[]>(team);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Sync localTeam with fetched team
  useEffect(() => {
    setLocalTeam(team);
  }, [team]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((member?: TeamMember) => {
    setEditingMember(member || null);
    setShowModal('team');
  }, [setShowModal]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      // Optimistic update: Remove member locally first
      const updatedTeam = localTeam.filter(member => member.id !== id);
      setLocalTeam(updatedTeam);
      updateContent({ ...contentData, team: updatedTeam });

      // Perform API delete
      await axios.delete(`${API_URL}/api/teams/${id}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
      });

      // Re-fetch to ensure consistency with server
      await fetchData();
    } catch (err) {
      console.error('Error deleting team member:', err);
      // Revert optimistic update on error
      setLocalTeam(team);
      updateContent({ ...contentData, team });
    }
  }, [localTeam, contentData, updateContent, fetchData, team]);

  const handleSave = useCallback(async (data: TeamMember) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('position', data.position);

      // Append image if it's a File object
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      // Append social links
      if (data.social_links) {
        if (data.social_links.twitter) {
          formData.append('social_links[twitter]', data.social_links.twitter);
        }
        if (data.social_links.linkedin) {
          formData.append('social_links[linkedin]', data.social_links.linkedin);
        }
        if (data.social_links.facebook) {
          formData.append('social_links[facebook]', data.social_links.facebook);
        }
      }

      let updatedTeam;

      if (data.id) {
        // Optimistic update: Update existing member locally
        updatedTeam = localTeam.map(member =>
          member.id === data.id
            ? {
                ...member,
                ...data,
                image: data.image instanceof File ? URL.createObjectURL(data.image) : data.image,
              }
            : member
        );
        setLocalTeam(updatedTeam);
        updateContent({ ...contentData, team: updatedTeam });

        // Perform API update
        formData.append('_method', 'PUT');
        const response = await axios.post(`${API_URL}/api/teams/${data.id}/update`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
          },
        });
        updatedTeam = localTeam.map(member =>
          member.id === data.id
            ? {
                ...response.data,
                image: response.data.image
                  ? `${API_URL}/storage/${response.data.image}`
                  : member.image,
              }
            : member
        );
      } else {
        // Optimistic update: Add new member locally with temporary ID
        const tempId = `temp-${Date.now()}`;
        updatedTeam = [
          ...localTeam,
          {
            ...data,
            id: tempId,
            image: data.image instanceof File ? URL.createObjectURL(data.image) : data.image,
          },
        ];
        setLocalTeam(updatedTeam);
        updateContent({ ...contentData, team: updatedTeam });

        // Perform API create
        const response = await axios.post(`${API_URL}/api/teams/create`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
          },
        });
        updatedTeam = localTeam.map(member =>
          member.id === tempId
            ? {
                ...response.data,
                image: response.data.image
                  ? `${API_URL}/storage/${response.data.image}`
                  : member.image,
              }
            : member
        );
      }

      // Update local state with final API response
      setLocalTeam(updatedTeam);
      updateContent({ ...contentData, team: updatedTeam });

      // Re-fetch to ensure consistency with server
      await fetchData();

      setShowModal(null);
      setEditingMember(null);
    } catch (err) {
      console.error('Error saving team member:', err);
      // Revert optimistic update on error
      setLocalTeam(team);
      updateContent({ ...contentData, team });
    }
  }, [localTeam, contentData, updateContent, setShowModal, fetchData, team]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
        <button
          onClick={() => handleEdit()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>
      {loading && <p className="text-gray-600">Loading team members...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localTeam.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-6 text-center bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-end space-x-2 mb-4">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {member.image && (
                <img
                  src={member.image.startsWith('http') || member.image.startsWith('blob:') ? member.image : `${API_URL}/storage/${member.image}`}
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    console.error(`Failed to load image for ${member.name}`);
                  }}
                />
              )}
              <h3 className="font-semibold mb-1 text-gray-800">{member.name}</h3>
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
      {showModal === 'team' && (
        <TeamModal
          data={editingMember || undefined}
          onSave={handleSave}
          onClose={() => {
            setShowModal(null);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
};

export default TeamSection;