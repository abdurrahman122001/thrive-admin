import React, { useEffect, useState } from 'react';
import { Edit3 } from 'lucide-react';
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

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/hero-slides')
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
              image: `http://127.0.0.1:8000/storage/${slide.image}`,
              orderIndex: slide.order_index,
            })),
            currentSlide: data.currentSlide || 0,
          },
        }));
      })
      .catch((error) => console.error('Error fetching hero slides:', error));
  }, []);

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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hero Section</h2>
        <button
          onClick={() => setShowModal('hero')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${contentData.hero.currentSlide * 100}%)` }}>
          {contentData.hero.slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{slide.title}</h3>
                  <p className="text-gray-600 mb-4">{slide.subtitle}</p>
                  <p className="text-gray-700">{slide.description}</p>
                </div>
                <div>
                  <img src={slide.image} alt={`Hero Slide ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => handleSlideChange(-1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
        >
          &lt;
        </button>
        <button
          onClick={() => handleSlideChange(1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
        >
          &gt;
        </button>
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