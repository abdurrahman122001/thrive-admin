import React, { useEffect, useState } from 'react';
import { Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentData } from '../../types';
import HeroModal from '../modals/HeroModal';

interface HeroSectionProps {
  updateContent: (data: ContentData) => void;
  showModal: string | null;
  setShowModal: (modal: string | null) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ updateContent, showModal, setShowModal }) => {
  const [contentData, setContentData] = useState<ContentData>({
    hero: { title: '', subtitle: '', description: '', image: '', slides: [], currentSlide: 0 },
    services: [],
    team: [],
    about: { id: 0, title: '' },
    contact: { phone: '', email: '', address: '', hours: '' },
    contactForm: { title: '', subtitle: '', successMessage: '' },
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://thriveenterprisesolutions.com.au/admin';

  useEffect(() => {
    fetch(`${API_URL}/api/hero-slides`)
      .then((response) => response.json())
      .then((data) => {
        setContentData((prev) => ({
          ...prev,
          hero: {
            ...prev.hero,
            slides: data.data.map((slide: any) => ({
              id: slide.id,
              title: slide.title,
              subtitle: slide.subtitle,
              description: slide.description,
              image: `${API_URL}/storage/${slide.image}`,
              orderIndex: slide.order_index,
            })),
            currentSlide: data.currentSlide || 0,
          },
        }));
      })
      .catch((error) => console.error('Error fetching hero slides:', error));
  }, [API_URL]);

  const handleSlideChange = (direction: number) => {
    setContentData((prev) => {
      const newContent = {
        ...prev,
        hero: {
          ...prev.hero,
          currentSlide: (prev.hero.currentSlide + direction + prev.hero.slides.length) % prev.hero.slides.length,
        },
      };
      updateContent(newContent);
      return newContent;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Hero Section</h2>
        <button
          onClick={() => setShowModal('hero')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Slides</span>
        </button>
      </div>
      <div className="relative w-full overflow-hidden rounded-xl">
        {contentData.hero.slides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No slides available. Add a slide to get started.
          </div>
        ) : (
          <>
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${contentData.hero.currentSlide * 100}%)` }}
            >
              {contentData.hero.slides.map((slide, index) => (
                <div key={slide.id || index} className="w-full flex-shrink-0">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-gray-800">{slide.title}</h3>
                      <p className="text-lg text-gray-600">{slide.subtitle}</p>
                      <p className="text-gray-700">{slide.description}</p>
                    </div>
                    <div>
                      <img
                        src={slide.image}
                        alt={`Hero Slide ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                        onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')} // Fallback image
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {contentData.hero.slides.length > 1 && (
              <>
                <button
                  onClick={() => handleSlideChange(-1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleSlideChange(1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        )}
      </div>
      {showModal === 'hero' && (
        <HeroModal
          data={contentData.hero}
          onSave={(data) => {
            setContentData((prev) => ({ ...prev, hero: data }));
            updateContent({ ...contentData, hero: data });
            setShowModal(null);
          }}
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  );
};

export default HeroSection;