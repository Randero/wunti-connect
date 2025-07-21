
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Target, Users, Lightbulb, Award, ArrowRight, CheckCircle } from 'lucide-react';

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const achievements = [
    'Professional Engineer with 15+ years experience',
    'Led infrastructure projects worth ₦80+ billion',
    'Improved a lot of communites by 300%',
    'Created Alot of employment opportunities',
    'Champion of youth empowerment programs',
    'Advocate for transparent governance',
  ];

  const visionPoints = [
    {
      icon: Target,
      title: 'Infrastructure Development',
      description: 'Modern roads, bridges, and digital infrastructure to connect communities and drive economic growth.',
    },
    {
      icon: Users,
      title: 'Community Empowerment',
      description: 'Skills training, job creation, and small business support to uplift every citizen.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation & Technology',
      description: 'Smart governance solutions and tech hubs to position our region as a digital leader.',
    },
    {
      icon: Award,
      title: 'Transparent Leadership',
      description: 'Open governance with regular public reporting and community involvement in decision-making.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-600 rounded-full font-semibold mb-6"
              >
                <Award className="w-5 h-5 mr-2" />
                About the Candidate
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                Engineering Progress,
                <span className="text-blue-600 block">Building Tomorrow</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Engr. Aliyu Muhammed Kombat brings decades of engineering excellence and community leadership 
                to serve the people. With a proven track record of delivering results and a vision for 
                sustainable development, he's ready to engineer a better future for all.
              </motion.p>

              {/* Achievements List */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="space-y-3 mb-8"
              >
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{achievement}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.8, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center"
              >
                Learn More About My Vision
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>

            {/* Right Content - Photo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src="/images/thewhite.jpg"
                  alt="Engr. Aliyu Muhammed Kombat"
                  className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-3xl" />
                
                {/* Floating Stats */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl"
                >
                  <div className="text-2xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl"
                >
                  <div className="text-2xl font-bold text-green-600">₦50B+</div>
                  <div className="text-sm text-gray-600">Projects Delivered</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20"
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vision for Progress
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A comprehensive plan to transform our communities through strategic development, 
              innovation, and inclusive governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {visionPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <point.icon className="w-8 h-8 text-white" />
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 mb-4">{point.title}</h4>
                <p className="text-gray-600 leading-relaxed">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
