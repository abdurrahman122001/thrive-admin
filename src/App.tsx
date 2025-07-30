import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainSite from './components/MainSite';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

export interface ContentData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
  };
  services: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
  }>;
  team: Array<{
    id: string;
    name: string;
    position: string;
    image: string;
    bio: string;
  }>;
  about: {
    title: string;
    description: string;
    mission: string;
    vision: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  contactForm: {
    title: string;
    subtitle: string;
    successMessage: string;
  };
}

export interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'replied';
}

const defaultData: ContentData = {
  hero: {
    title: "Empowering Business Growth",
    subtitle: "Thrive Enterprise Solutions",
    description: "Transform your business with our comprehensive enterprise solutions. We deliver innovative technology and strategic consulting to help your organization thrive in today's competitive landscape.",
    image: "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=1200"
  },
  services: [
    {
      id: '1',
      title: "Digital Transformation",
      description: "Modernize your business operations with cutting-edge digital solutions and cloud technologies.",
      icon: "Zap",
      features: ["Cloud Migration", "Process Automation", "Digital Strategy", "Technology Consulting"]
    },
    {
      id: '2',
      title: "Business Consulting",
      description: "Strategic guidance to optimize your business processes and drive sustainable growth.",
      icon: "TrendingUp",
      features: ["Strategic Planning", "Process Optimization", "Performance Analytics", "Change Management"]
    },
    {
      id: '3',
      title: "IT Solutions",
      description: "Comprehensive IT services to ensure your technology infrastructure supports your business goals.",
      icon: "Server",
      features: ["Infrastructure Management", "Cybersecurity", "Software Development", "IT Support"]
    }
  ],
  team: [
    {
      id: '1',
      name: "Sarah Johnson",
      position: "CEO & Founder",
      image: "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "With over 15 years of experience in enterprise solutions, Sarah leads our vision for transformative business growth."
    },
    {
      id: '2',
      name: "Michael Chen",
      position: "CTO",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Michael brings deep technical expertise and innovation to deliver cutting-edge solutions for our clients."
    },
    {
      id: '3',
      name: "Emily Davis",
      position: "Head of Consulting",
      image: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Emily specializes in strategic consulting and helps organizations navigate complex business transformations."
    }
  ],
  about: {
    title: "About Thrive Enterprise Solutions",
    description: "We are a leading enterprise solutions provider dedicated to helping businesses transform and thrive in the digital age. Our team of experts combines deep industry knowledge with innovative technology to deliver results that matter.",
    mission: "To empower businesses with innovative solutions that drive growth, efficiency, and competitive advantage.",
    vision: "To be the trusted partner for enterprises seeking transformative business solutions and sustainable success."
  },
  contact: {
    phone: "+61 2 8765 4321",
    email: "info@thriveenterprisesolutions.com.au",
    address: "Level 15, 123 Collins Street, Melbourne VIC 3000, Australia",
    hours: "Monday - Friday: 9:00 AM - 6:00 PM"
  },
  contactForm: {
    title: "Get in touch",
    subtitle: "Feel free to contact us and we will get back to you as soon as possible",
    successMessage: "Thank you for your message! We'll get back to you within 24 hours."
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contentData, setContentData] = useState<ContentData>(defaultData);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('thriveContentData');
    if (savedData) {
      setContentData(JSON.parse(savedData));
    }

    const savedSubmissions = localStorage.getItem('thriveContactSubmissions');
    if (savedSubmissions) {
      setContactSubmissions(JSON.parse(savedSubmissions));
    }

    const authStatus = localStorage.getItem('thriveAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const updateContent = (newData: ContentData) => {
    setContentData(newData);
    localStorage.setItem('thriveContentData', JSON.stringify(newData));
  };

  const addContactSubmission = (submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newSubmission: ContactSubmission = {
      ...submission,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'new'
    };
    const updatedSubmissions = [newSubmission, ...contactSubmissions];
    setContactSubmissions(updatedSubmissions);
    localStorage.setItem('thriveContactSubmissions', JSON.stringify(updatedSubmissions));
  };

  const updateContactSubmissions = (submissions: ContactSubmission[]) => {
    setContactSubmissions(submissions);
    localStorage.setItem('thriveContactSubmissions', JSON.stringify(submissions));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<MainSite contentData={contentData} onContactSubmit={addContactSubmission} />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard 
                contentData={contentData} 
                updateContent={updateContent}
                setIsAuthenticated={setIsAuthenticated}
                contactSubmissions={contactSubmissions}
                updateContactSubmissions={updateContactSubmissions}
              /> : 
              <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;