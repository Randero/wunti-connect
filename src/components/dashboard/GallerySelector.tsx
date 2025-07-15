import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plus, ArrowRight, ImageIcon, Sparkles } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  caption?: string;
}

interface GallerySelectorProps {
  selectedImages: GalleryImage[];
  onImageSelection: (images: GalleryImage[]) => void;
}

const GallerySelector: React.FC<GallerySelectorProps> = ({ 
  selectedImages, 
  onImageSelection 
}) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: GalleryImage) => {
    const isSelected = selectedImages.some(img => img.id === image.id);
    
    if (isSelected) {
      // Remove image
      const newSelection = selectedImages.filter(img => img.id !== image.id);
      onImageSelection(newSelection);
    } else {
      // Add image (max 5)
      if (selectedImages.length < 5) {
        const newSelection = [...selectedImages, image];
        onImageSelection(newSelection);
      } else {
        toast({
          title: "Maximum Selection Reached",
          description: "You can select up to 5 images only",
          variant: "destructive"
        });
      }
    }
  };

  const canProceed = selectedImages.length >= 2;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary mr-3" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose Your Campaign Images
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Select between 2-5 images to share on social media
        </p>
        
        <div className="flex items-center justify-center mt-4 space-x-4">
          <Badge variant={selectedImages.length >= 2 ? "default" : "secondary"}>
            {selectedImages.length} selected
          </Badge>
          <Badge variant="outline">
            Min: 2 images
          </Badge>
          <Badge variant="outline">
            Max: 5 images
          </Badge>
        </div>
      </motion.div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {galleryImages.map((image, index) => {
            const isSelected = selectedImages.some(img => img.id === image.id);
            const selectionIndex = selectedImages.findIndex(img => img.id === image.id);
            
            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleImageClick(image)}
                className={`relative cursor-pointer group ${
                  isSelected ? 'ring-4 ring-primary ring-offset-2' : ''
                }`}
              >
                <Card className="overflow-hidden border-2 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-0 relative">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold truncate">
                          {image.title}
                        </h3>
                        {image.caption && (
                          <p className="text-white/80 text-sm truncate">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    <div className="absolute top-3 right-3">
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold"
                        >
                          {selectionIndex + 1}
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="bg-white/20 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-4 w-4" />
                        </motion.div>
                      )}
                    </div>

                    {/* Selected Check */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 left-3"
                      >
                        <CheckCircle className="h-6 w-6 text-primary bg-white rounded-full" />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {galleryImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Campaign Images Available</h3>
          <p className="text-muted-foreground">
            Please check back later for new campaign content
          </p>
        </motion.div>
      )}

      {/* Proceed Button */}
      <AnimatePresence>
        {canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Proceed to Social Media
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Summary */}
      {selectedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20"
        >
          <h3 className="text-lg font-semibold mb-4">Selected Images ({selectedImages.length})</h3>
          <div className="flex flex-wrap gap-3">
            {selectedImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-primary/30"
                />
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GallerySelector;