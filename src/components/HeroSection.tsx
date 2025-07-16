
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Users, Target, Award, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Placeholder candidate photos - in production, these would be high-res photos
  const candidatePhotos = [
    {
      id: 1,
      src: "KC/fada.png",
      title: "Leadership Vision",
      description: "Building tomorrow's infrastructure today"
    },
    {
      id: 2,
      src: "KC/theblue.png",
      title: "Community Focus",
      description: "Serving the people with dedication and integrity"
    },
    {
      id: 3,
      src: "KC/guy.png",
      title: "Engineering Excellence",
      description: "Technical expertise for practical solutions"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % candidatePhotos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToNext = () => {
    const element = document.getElementById('stats');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)',
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white mb-6"
            >
              <Award className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Verified Candidate 2025</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Engr. Aliyu Muhammed
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                className="block font-extrabold text-yellow-400"
              >
                Kombat
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xl text-blue-100 mb-8 max-w-2xl"
            >
              Engineering progress, building communities, and creating opportunities for every citizen. Join the movement for real change.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                onClick={() => navigate('/post-earn')}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Post & Earn Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={() => navigate('/register')}
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-200"
              >
                <Users className="w-5 h-5 mr-2" />
                Join Movement
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex items-center justify-center lg:justify-start space-x-8 mt-8 text-white/80"
            >
              <div className="text-center">
                <div className="text-2xl font-bold">1,250+</div>
                <div className="text-sm">Active Supporters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15K+</div>
                <div className="text-sm">Posts Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Photo Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={ { duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Main Photo Display */}
              <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={candidatePhotos[currentSlide].src}
                      alt={candidatePhotos[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold mb-2">{candidatePhotos[currentSlide].title}</h3>
                      <p className="text-white/90">{candidatePhotos[currentSlide].description}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Photo Navigation Dots */}
              <div className="flex justify-center space-x-3 mt-6">
                {candidatePhotos.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlide 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-400/30 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Users className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.button
            onClick={scrollToNext}
            whileHover={{ scale: 1.1 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
