import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

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
  const [formData, setFormData] = useState(data);
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(data.slides.map(() => null));

  useEffect(() => {
    const savedData = localStorage.getItem('heroSlides');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    const slidesToSave = formData.slides.map((slide, index) => {
      const file = selectedFiles[index];
      if (file) {
        formDataToSend.append(`slides[${index}][image]`, file);
      }
      return {
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        image: file ? URL.createObjectURL(file) : slide.image,
        order_index: slide.orderIndex,
      };
    });

    slidesToSave.forEach((slide, index) => {
      formDataToSend.append(`slides[${index}][id]`, slide.id?.toString() || '');
      formDataToSend.append(`slides[${index}][title]`, slide.title);
      formDataToSend.append(`slides[${index}][subtitle]`, slide.subtitle);
      formDataToSend.append(`slides[${index}][description]`, slide.description);
      formDataToSend.append(`slides[${index}][order_index]`, slide.order_index.toString());
    });
    formDataToSend.append('currentSlide', formData.currentSlide.toString());

    try {
      const response = await fetch('http://127.0.0.1:8000/api/hero-slides', {
        method: 'post',
        body: formDataToSend,
      });
      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({
          ...prev,
          slides: result.data.map((slide: any) => ({
            id: slide.id,
            title: slide.title,
            subtitle: slide.subtitle,
            description: slide.description,
            image: `http://127.0.0.1:8000/storage/${slide.image}`,
            orderIndex: slide.order_index,
          })),
          currentSlide: result.currentSlide,
        }));
        localStorage.setItem('heroSlides', JSON.stringify(formData));
        onSave(formData);
      }
    } catch (error) {
      console.error('Error saving hero slides:', error);
    }
  };

  const addSlide = () => {
    setFormData({
      ...formData,
      slides: [...formData.slides, { id: undefined, title: '', subtitle: '', description: '', image: '', orderIndex: formData.slides.length }],
    });
    setSelectedFiles([...selectedFiles, null]);
  };

  const updateSlide = (index: number, field: string, value: string | File) => {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Hero Section</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formData.slides.map((slide, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Slide {index + 1}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide(index, 'title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={slide.description}
                  onChange={(e) => updateSlide(index, 'description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) updateSlide(index, 'image', file);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {(selectedFiles[index] || slide.image) && (
                  <div className="mt-3">
                    <img
                      src={selectedFiles[index] ? URL.createObjectURL(selectedFiles[index]!) : `http://127.0.0.1:8000/storage/${slide.image}`}
                      alt={`Preview Slide ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Index</label>
                <input
                  type="number"
                  value={slide.orderIndex}
                  onChange={(e) => updateSlide(index, 'orderIndex', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSlide}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Slide
          </button>
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroModal;