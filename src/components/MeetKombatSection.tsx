import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { User, Target, Building, Users } from 'lucide-react';

const MeetKombatSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const kombatProfiles = [
    {
      id: 1,
      image: "/images/redcapacity.jpg",
      title: "Visionary Leader",
      description: "Leading with integrity and a clear vision for progress. Engineering minds and building solutions that transform communities through innovative infrastructure development.",
      icon: Target,
      gradient: "from-blue-600 to-blue-800"
    },
    {
      id: 2,
      image: "/images/fadacapacity.jpg",
      title: "Community Champion",
      description: "Dedicated to serving the people with unwavering commitment. Building bridges between diverse communities and fostering unity through inclusive governance and development.",
      icon: Users,
      gradient: "from-purple-600 to-purple-800"
    },
    {
      id: 3,
      image: "/images/guy.png",
      title: "Engineering Excellence",
      description: "Technical expertise meets practical solutions. Applying engineering principles to create sustainable infrastructure that drives economic growth and improves quality of life.",
      icon: Building,
      gradient: "from-green-600 to-green-800"
    },
    {
      id: 4,
      image: "/images/connection.png",
      title: "Progressive Innovator",
      description: "Pioneering new approaches to governance and development. Leveraging technology and modern methodologies to create efficient, transparent, and citizen-centered public services.",
      icon: User,
      gradient: "from-orange-600 to-orange-800"
    }
  ];

  return (
    <section id="meet-kombat" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)',
          backgroundSize: '100px 100px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 rounded-full font-semibold mb-8"
          >
            <User className="w-5 h-5 mr-2" />
            Meet Kombat
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Engr. Aliyu Muhammed
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Kombat</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed"
          >
            A multifaceted leader combining engineering expertise with visionary governance. 
            Discover the different aspects of a leader committed to progress, innovation, and community development.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {kombatProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 60, rotateY: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={profile.image}
                    alt={profile.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-125 contrast-110"
                    whileHover={{ scale: 1.1 }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${profile.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon Overlay */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                    className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                  >
                    <profile.icon className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                    className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors"
                  >
                    {profile.title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                    className="text-slate-300 text-sm leading-relaxed group-hover:text-slate-200 transition-colors"
                  >
                    {profile.description}
                  </motion.p>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t ${profile.gradient} mix-blend-overlay rounded-2xl`} />
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full opacity-60"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.7 }}
                className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400 rounded-full opacity-40"
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom Accent */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"
        />
      </div>
    </section>
  );
};

export default MeetKombatSection;
