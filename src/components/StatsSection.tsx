
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, DollarSign, Share2, Award, TrendingUp, Zap } from 'lucide-react';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    {
      icon: Users,
      value: 1250,
      label: 'Active Supporters',
      prefix: '',
      suffix: '+',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Share2,
      value: 15420,
      label: 'Posts Shared',
      prefix: '',
      suffix: '+',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: TrendingUp,
      value: 340,
      label: 'Daily Growth',
      prefix: '',
      suffix: '%',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      icon: Zap,
      value: 24,
      label: 'Average Earn Time',
      prefix: '',
      suffix: ' hrs',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <section id="stats" className="py-20 bg-gradient-to-br from-gray-50 to-white">
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
            className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-600 rounded-full font-semibold mb-6"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Campaign Analytics
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Real Impact, Real Numbers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of supporters who are already earning while helping spread our message of progress and change.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              {...stat}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-8 md:p-12 text-white">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="max-w-4xl mx-auto"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Earning?
              </h3>
              <p className="text-xl text-blue-100 mb-8">
                Join our community and start earning rewards for supporting the campaign. It's simple, fast, and rewarding!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  <Zap className="w-5 h-5 mr-2 inline" />
                  Start Earning Today
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-200"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  prefix: string;
  suffix: string;
  color: string;
  bgColor: string;
  index: number;
  isInView: boolean;
}

const StatCard = ({ icon: Icon, value, label, prefix, suffix, color, bgColor, index, isInView }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const duration = 2000;
        const steps = 50;
        const increment = value / steps;
        let current = 0;
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= value) {
            setDisplayValue(value);
            clearInterval(counter);
          } else {
            setDisplayValue(Math.floor(current));
          }
        }, duration / steps);
        
        return () => clearInterval(counter);
      }, index * 100);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, value, index]);

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    } else if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return val.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mr-4`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold text-gray-900">
            {prefix}{formatValue(displayValue)}{suffix}
          </div>
        </div>
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
      
      {/* Progress indicator */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: '100%' } : {}}
          transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
          className={`h-1 rounded-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </motion.div>
  );
};

export default StatsSection;
