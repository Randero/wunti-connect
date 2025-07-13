import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const GallerySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_gallery')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery:', error);
        return;
      }

      setGalleryImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  // Ultra-modern campaign gallery images
  const defaultImages = [
    {
      id: '1',
      image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      title: 'Campaign Launch Rally',
      description: 'Massive campaign launch with over 50,000 supporters at the National Stadium, marking the beginning of our transformative journey.'
    },
    {
      id: '2',
      image_url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
      title: 'Town Hall Meeting',
      description: 'Interactive community forums where citizens voice their concerns and shape policy decisions for inclusive governance.'
    },
    {
      id: '3',
      image_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
      title: 'Healthcare Reform Initiative',
      description: 'Groundbreaking healthcare policy announcement ensuring free medical care for all citizens under 18 and above 65.'
    },
    {
      id: '4',
      image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
      title: 'Youth Empowerment Summit',
      description: 'Launching the largest youth skills acquisition program in Nigeria, targeting 1 million young entrepreneurs.'
    },
    {
      id: '5',
      image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
      title: 'Economic Revival Plan',
      description: 'Strategic partnership with international investors to create 5 million jobs across manufacturing and technology sectors.'
    },
    {
      id: '6',
      image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80',
      title: 'Green Nigeria Initiative',
      description: 'Ambitious environmental program to plant 100 million trees and achieve carbon neutrality by 2030.'
    },
    {
      id: '7',
      image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
      title: 'Digital Innovation Hub',
      description: 'Opening state-of-the-art technology centers in all 36 states to bridge the digital divide and foster innovation.'
    },
    {
      id: '8',
      image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
      title: 'Educational Excellence Program',
      description: 'Revolutionary education reform providing free quality education and digital learning tools for every Nigerian child.'
    },
    {
      id: '9',
      image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      title: 'Infrastructure Development',
      description: 'Massive infrastructure overhaul including new highways, rail systems, and smart cities across all geopolitical zones.'
    },
    {
      id: '10',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      title: 'Technology & Innovation',
      description: 'Establishing Nigeria as the tech hub of Africa with comprehensive digital transformation initiatives.'
    },
    {
      id: '11',
      image_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80',
      title: 'Rural Development Focus',
      description: 'Comprehensive rural development program bringing modern infrastructure and opportunities to every village.'
    },
    {
      id: '12',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
      title: 'Women Empowerment Initiative',
      description: 'Groundbreaking program supporting 10 million women entrepreneurs with micro-loans and business training.'
    }
  ];

  const images = galleryImages.length > 0 ? galleryImages : defaultImages;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-blue-200 text-blue-700 rounded-full font-bold mb-8 shadow-lg"
          >
            <Image className="w-6 h-6 mr-3" />
            Campaign Gallery
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-8"
          >
            Moments from the
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">Movement</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
          >
            Witness the energy, passion, and unity of our campaign through these powerful captured moments that tell the story of our journey together.
          </motion.p>
        </motion.div>

        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="relative"
          >
            {/* Main Image Display */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-white via-slate-50 to-white rounded-3xl shadow-2xl overflow-hidden mb-12 border border-slate-200">
                <div className="aspect-[16/10] relative">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    src={images[currentImageIndex]?.image_url}
                    alt={images[currentImageIndex]?.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Modern Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20" />
                  
                  {/* Enhanced Navigation Buttons */}
                  <motion.button
                    onClick={prevImage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-200 rounded-full flex items-center justify-center group"
                  >
                    <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </motion.button>
                  
                  <motion.button
                    onClick={nextImage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-200 rounded-full flex items-center justify-center group"
                  >
                    <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </motion.button>

                  {/* Enhanced Image Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-8 left-8 right-8"
                  >
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                      <h3 className="text-3xl font-bold text-white mb-3">{images[currentImageIndex]?.title}</h3>
                      <p className="text-lg text-white/90 leading-relaxed">
                        {images[currentImageIndex]?.caption || images[currentImageIndex]?.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Progress Indicator */}
                  <div className="absolute top-6 left-6 right-6">
                    <div className="flex space-x-2">
                      {images.map((_, index) => (
                        <motion.div
                          key={index}
                          initial={{ width: 0 }}
                          animate={{ width: index === currentImageIndex ? '2rem' : '0.5rem' }}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            index === currentImageIndex 
                              ? 'bg-white shadow-lg' 
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Feature Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="group relative"
                  >
                    <motion.button
                      onClick={() => setCurrentImageIndex(index)}
                      className="w-full aspect-square relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300"
                      whileHover={{ y: -8, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Title on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="text-white font-semibold text-sm leading-tight">{image.title}</h4>
                      </div>
                      
                      {/* Active State */}
                      {index === currentImageIndex && (
                        <>
                          <div className="absolute inset-0 ring-3 ring-blue-500 ring-opacity-60 rounded-xl" />
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-lg"
                          />
                        </>
                      )}
                      
                      {/* Professional Number Badge */}
                      <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-800">{index + 1}</span>
                      </div>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;