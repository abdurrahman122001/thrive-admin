import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Loader2 } from 'lucide-react';

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  slides: { id?: number; title: string; subtitle: string; description: string; image: string; orderIndex: number }[];
  currentSlide: number;
}

interface HeroModalProps {
  data: HeroData;
  onSave: (data: HeroData) => void;
  onClose: () => void;
}

const HeroModal: React.FC<HeroModalProps> = ({ data, onSave, onClose }) => {
  const [formData, setFormData] = useState<HeroData>(data);
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(data.slides.map(() => null));
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'https://thriveenterprisesolutions.com.au/admin';

  useEffect(() => {
    const savedData = localStorage.getItem('heroSlides');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();

    formData.slides.forEach((slide, index) => {
      const file = selectedFiles[index];
      if (file) {
        formDataToSend.append(`slides[${index}][image]`, file);
      }
      formDataToSend.append(`slides[${index}][id]`, slide.id?.toString() || '');
      formDataToSend.append(`slides[${index}][title]`, slide.title);
      formDataToSend.append(`slides[${index}][subtitle]`, slide.subtitle);
      formDataToSend.append(`slides[${index}][description]`, slide.description);
      formDataToSend.append(`slides[${index}][order_index]`, slide.orderIndex.toString());
    });

    formDataToSend.append('currentSlide', formData.currentSlide.toString());

    try {
      const response = await fetch(`${API_URL}/api/hero-slides`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        const updatedFormData = {
          ...formData,
          slides: result.data.map((slide: any) => ({
            id: slide.id,
            title: slide.title,
            subtitle: slide.subtitle,
            description: slide.description,
            image: `${API_URL}/storage/${slide.image}`,
            orderIndex: slide.order_index,
          })),
          currentSlide: result.currentSlide,
        };
        setFormData(updatedFormData);
        localStorage.setItem('heroSlides', JSON.stringify(updatedFormData));
        onSave(updatedFormData);
        onClose();
      } else {
        console.error('Failed to save hero slides:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving hero slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSlide = () => {
    setFormData({
      ...formData,
      slides: [
        ...formData.slides,
        { id: undefined, title: '', subtitle: '', description: '', image: '', orderIndex: formData.slides.length },
      ],
    });
    setSelectedFiles([...selectedFiles, null]);
  };

  const removeSlide = (index: number) => {
    setFormData({
      ...formData,
      slides: formData.slides.filter((_, i) => i !== index),
    });
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, field: string, value: string | File | number) => {
    const newSlides = [...formData.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setFormData({ ...formData, slides: newSlides });
    if (field === 'image' && value instanceof File) {
      const newFiles = [...selectedFiles];
      newFiles[index] = value;
      setSelectedFiles(newFiles);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Hero Slides</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formData.slides.map((slide, index) => (
            <div key={index} className="border border-gray-200 p-6 rounded-lg relative bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Slide {index + 1}</h3>
                {formData.slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlide(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              {/* Title */}
              <input
                type="text"
                value={slide.title}
                onChange={(e) => updateSlide(index, 'title', e.target.value)}
                placeholder="Enter slide title"
                className="w-full mb-3 px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
              {/* Subtitle */}
              <input
                type="text"
                value={slide.subtitle}
                onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                placeholder="Enter slide subtitle"
                className="w-full mb-3 px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
              {/* Description */}
              <textarea
                value={slide.description}
                onChange={(e) => updateSlide(index, 'description', e.target.value)}
                rows={3}
                className="w-full mb-3 px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
              {/* Image */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) updateSlide(index, 'image', file);
                }}
                className="w-full mb-3"
              />
              {(selectedFiles[index] || slide.image) && (
                <img
                  src={selectedFiles[index] ? URL.createObjectURL(selectedFiles[index]!) : slide.image}
                  alt={`Preview Slide ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg shadow-sm"
                />
              )}
              {/* Order Index */}
              <input
                type="number"
                value={slide.orderIndex}
                onChange={(e) => updateSlide(index, 'orderIndex', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
          ))}

          {/* Add Slide Button */}
          <button
            type="button"
            onClick={addSlide}
            className="w-full py-3 bg-green-600 text-white rounded-lg flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Slide
          </button>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroModal;
