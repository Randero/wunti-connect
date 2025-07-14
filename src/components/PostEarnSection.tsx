
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Facebook, Instagram, X, DollarSign, Smartphone, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PostEarnSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const navigate = useNavigate();
  const { user } = useAuth();

  const platforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      reward: '₦200',
      dataReward: '200 MB',
      color: 'bg-[#1877F2]',
      hoverColor: 'hover:bg-[#166FE5]',
      accentColor: 'from-[#E7F3FF] to-[#DEEBFF]',
      shadowColor: 'shadow-[#1877F2]/30',
      glowColor: 'hover:shadow-[#1877F2]/50',
      border: 'border-[#1877F2]/20',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      reward: '₦500',
      dataReward: '500 MB',
      color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045]',
      hoverColor: 'hover:from-[#7A2D9C] hover:via-[#E81717] hover:to-[#E39D3C]',
      accentColor: 'from-[#F4E6FF] to-[#FFE6E6]',
      shadowColor: 'shadow-[#833AB4]/30',
      glowColor: 'hover:shadow-[#833AB4]/50',
      border: 'border-[#833AB4]/20',
    },
    {
      name: 'X',
      icon: X,
      reward: '₦700',
      dataReward: '700 MB',
      color: 'bg-[#000000]',
      hoverColor: 'hover:bg-[#1a1a1a]',
      accentColor: 'from-[#F7F7F7] to-[#EEEEEE]',
      shadowColor: 'shadow-black/40',
      glowColor: 'hover:shadow-black/60',
      border: 'border-black/20',
    },
  ];

  const steps = [
    {
      step: 1,
      title: 'Sign In',
      description: 'Login to your account to access the dashboard',
      icon: CheckCircle,
    },
    {
      step: 2,
      title: 'Select 2 Images',
      description: 'Choose 2 campaign images from our gallery',
      icon: Smartphone,
    },
    {
      step: 3,
      title: 'Post to Social Media',
      description: 'Share the images on your selected platform',
      icon: Zap,
    },
    {
      step: 4,
      title: 'Submit Post Link',
      description: 'Copy and paste your post link in the dashboard',
      icon: DollarSign,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-full font-semibold mb-6"
          >
            <Zap className="w-5 h-5 mr-2" />
            Post & Earn Program
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Earn While You Support
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Share campaign content on social media and get rewarded instantly. Choose airtime or data - it's that simple!
          </p>
          
          {/* Daily Limit Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-full text-orange-700 font-semibold mb-8"
          >
            <Clock className="w-5 h-5 mr-2" />
            Daily Limit: One reward per 24 hours
          </motion.div>
        </motion.div>

        {/* Ultra Modern Platform Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ 
                delay: 0.6 + index * 0.15, 
                duration: 0.8,
                type: "spring",
                stiffness: 120
              }}
              whileHover={{ 
                scale: 1.03, 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Main Card Container */}
              <div className="relative h-96 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                
                {/* Header Section */}
                <div className="text-center p-8 pb-6">
                  {/* Icon Container */}
                  <motion.div 
                    whileHover={{ 
                      scale: 1.1,
                      transition: { duration: 0.3 }
                    }}
                    className="relative mx-auto mb-4 w-16 h-16"
                  >
                    <div 
                      className={`w-full h-full ${platform.color} ${platform.hoverColor} rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300`}
                      style={{
                        background: platform.name === 'Instagram' 
                          ? 'linear-gradient(45deg, #833AB4, #FD1D1D, #FCB045)' 
                          : undefined
                      }}
                    >
                      <platform.icon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  
                  {/* Platform Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {platform.name}
                  </h3>
                  <p className="text-gray-500 text-sm">Social Media Platform</p>
                </div>
                
                {/* Rewards Section */}
                <div className="px-8 space-y-3 mb-4">
                  {/* Cash Reward */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 font-medium">Airtime</span>
                    </div>
                    <span className="text-green-600 font-bold text-lg">{platform.reward}</span>
                  </div>
                  
                  {/* Data Reward */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700 font-medium">Data</span>
                    </div>
                    <span className="text-blue-600 font-bold text-lg">{platform.dataReward}</span>
                  </div>
                </div>
                
                {/* Reward Type Indicator */}
                <div className="px-8 mb-4">
                  <p className="text-xs text-gray-500 text-center">Choose between airtime or data</p>
                </div>
                
                {/* CTA Button */}
                <div className="px-8 pb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => user ? navigate('/dashboard') : navigate('/auth')}
                    className="w-full py-2.5 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                  >
                    Choose {platform.name}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Start Earning Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => user ? navigate('/dashboard') : navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              <Zap className="w-6 h-6 mr-3" />
              Start Earning Now
            </Button>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 backdrop-blur-sm overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-100/30 to-blue-100/30 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 text-blue-700 rounded-full font-semibold mb-6 backdrop-blur-sm"
              >
                <Zap className="w-5 h-5 mr-2" />
                Step by Step Guide
              </motion.div>
              
              <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-6">
                How It Works
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Four simple steps to start earning rewards with your social media posts
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ 
                    delay: 1.2 + index * 0.15, 
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  className="group text-center relative"
                >
                  {/* Step connector line */}
                  {index < steps.length - 1 && (
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ delay: 1.8 + index * 0.1, duration: 0.8 }}
                      className="hidden lg:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 -translate-y-1/2 z-0 rounded-full opacity-60"
                      style={{ originX: 0 }}
                    />
                  )}
                  
                  <div className="relative z-10 bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    {/* Floating icon with enhanced styling */}
                    <motion.div 
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        scale: 1.1
                      }}
                      transition={{ 
                        duration: 0.6,
                        ease: "easeInOut"
                      }}
                      className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-500"
                    >
                      <step.icon className="w-10 h-10 text-white drop-shadow-lg" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20 rounded-3xl"></div>
                      
                      {/* Floating step number */}
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ delay: 1.5 + index * 0.1, duration: 0.5, type: "spring" }}
                        className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                      >
                        {step.step}
                      </motion.div>
                    </motion.div>
                    
                    <motion.h4 
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                      className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300"
                    >
                      {step.title}
                    </motion.h4>
                    
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: 1.5 + index * 0.1, duration: 0.6 }}
                      className="text-gray-600 leading-relaxed"
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 2.0, duration: 0.8 }}
              className="relative bg-gradient-to-r from-blue-50/80 via-white/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100/50 shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-3xl"></div>
              
              <div className="relative z-10">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 2.2, duration: 0.6 }}
                  className="text-center text-gray-700 leading-relaxed text-lg"
                >
                  Rewards are processed automatically and delivered within 24 hours of verification. 
                  Choose between instant cash payments or data top-ups.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PostEarnSection;
