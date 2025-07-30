import React, { useEffect } from 'react';
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
  setEditingItem: (item: any) => void;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  contentData,
  updateContent,
  showModal,
  setShowModal,
  setEditingItem,
}) => {
  const { data: team, loading, error, fetchData } = useApiFetch<TeamMember>('team', [], contentData, updateContent);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (item?: TeamMember) => {
    setEditingItem(item);
    setShowModal('team');
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/teams/${id}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}` },
      });
      const updatedTeam = team.filter(member => member.id !== id);
      updateContent({ ...contentData, team: updatedTeam });
    } catch (err) {
      console.error('Error deleting team member:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <button
          onClick={() => handleEdit()}
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
          {team.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="flex justify-end space-x-2 mb-4">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
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
      {showModal === 'team' && (
        <TeamModal
          data={team.find(t => t.id === (showModal ? (showModal as any).id : undefined)) || undefined}
          onSave={async (data) => {
            try {
              let updatedTeam;
              let response: { data: TeamMember };
              const formData = new FormData();
              formData.append('name', data.name);
              formData.append('position', data.position);
              if (data.image instanceof File) {
                formData.append('image', data.image);
              }
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
              if (data.id) {
                response = await axios.post(`http://127.0.0.1:8000/api/teams/${data.id}/update`, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
                  },
                });
                updatedTeam = team.map(t => t.id === data.id ? { ...response.data, image: `http://127.0.0.1:8000/storage/${response.data.image}` } : t);
              } else {
                response = await axios.post('http://127.0.0.1:8000/api/teams/create', formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
                  },
                });
                updatedTeam = [...team, { ...response.data, image: `http://127.0.0.1:8000/storage/${response.data.image}` }];
              }
              updateContent({ ...contentData, team: updatedTeam });
            } catch (err) {
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
    </div>
  );
};

export default TeamSection;