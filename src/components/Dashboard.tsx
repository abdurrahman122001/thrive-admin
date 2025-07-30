import React, { useState } from 'react';
import { ContentData, ContactSubmission } from '../types';
import Sidebar from './dashboard/Sidebar';
import HeroSection from './dashboard/HeroSection';
import ServicesSection from './dashboard/ServicesSection';
import TeamSection from './dashboard/TeamSection';
import AboutSection from './dashboard/AboutSection';
import ContactSection from './dashboard/ContactSection';
import ContactFormSection from './dashboard/ContactFormSection';
import SubmissionsSection from './dashboard/SubmissionsSection';

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
  updateContactSubmissions,
}) => {
  const [activeTab, setActiveTab] = useState('hero');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setIsAuthenticated={setIsAuthenticated} />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'hero' && (
            <HeroSection
              contentData={contentData}
              updateContent={updateContent}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          )}
          {activeTab === 'services' && (
            <ServicesSection
              contentData={contentData}
              updateContent={updateContent}
              showModal={showModal}
              setShowModal={setShowModal}
              setEditingItem={setEditingItem}
            />
          )}
          {activeTab === 'team' && (
            <TeamSection
              contentData={contentData}
              updateContent={updateContent}
              showModal={showModal}
              setShowModal={setShowModal}
              setEditingItem={setEditingItem}
            />
          )}
          {activeTab === 'about' && (
            <AboutSection
              contentData={contentData}
              updateContent={updateContent}
              showModal={showModal}
              setShowModal={setShowModal}
              setEditingItem={setEditingItem}
            />
          )}
          {activeTab === 'contact' && (
            <ContactSection
              contentData={contentData}
              updateContent={updateContent}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          )}
      
          {activeTab === 'submissions' && (
            <SubmissionsSection
              contactSubmissions={contactSubmissions}
              updateContactSubmissions={updateContactSubmissions}
              selectedSubmission={selectedSubmission}
              setSelectedSubmission={setSelectedSubmission}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;