import React, { useState } from 'react';
import { ContentData, ContactSubmission, FooterData } from '../types';
import Sidebar from './dashboard/Sidebar';
import HeroSection from './dashboard/HeroSection';
import ServicesSection from './dashboard/ServicesSection';
import TeamSection from './dashboard/TeamSection';
import AboutSection from './dashboard/AboutSection';
import ContactSection from './dashboard/ContactSection';
import ContactFormSection from './dashboard/ContactFormSection';
import SubmissionsSection from './dashboard/SubmissionsSection';
import FooterSection from './dashboard/FooterSection';
import { Home, Settings, Users, FileText, MessageSquare, Mail } from 'lucide-react';

interface DashboardProps {
  contentData: ContentData;
  updateContent: (data: ContentData) => void;
  onLogout: () => void;
  contactSubmissions: ContactSubmission[];
  updateContactSubmissions: (submissions: ContactSubmission[]) => void;
  footerData: FooterData[];
  updateFooterData: (data: FooterData[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  contentData,
  updateContent,
  onLogout,
  contactSubmissions,
  updateContactSubmissions,
  footerData,
  updateFooterData,
}) => {
  const [activeTab, setActiveTab] = useState('hero');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: Home },
    { id: 'services', name: 'Services', icon: Settings },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'about', name: 'About', icon: FileText },
    { id: 'contact', name: 'Contact', icon: MessageSquare },
    { id: 'submissions', name: 'Form Submissions', icon: FileText },
    { id: 'footer', name: 'Footer', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        tabs={tabs}
      />

      <div className="flex-1 p-8 overflow-auto">
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
          {activeTab === 'contact-form' && (
            <ContactFormSection
              contentData={contentData}
              updateContent={updateContent}
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
          {activeTab === 'footer' && (
            <FooterSection
              footerData={footerData}
              updateFooterData={updateFooterData}
              showModal={showModal}
              setShowModal={setShowModal}
              setEditingItem={setEditingItem}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;