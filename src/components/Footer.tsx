
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  const quickLinks = [
    { name: 'About', href: '#about' },
    { name: 'Vision', href: '#vision' },
    { name: 'Contact', href: '#contact' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#contact' },
    { name: 'Privacy Policy', href: '#contact' },
    { name: 'Terms of Service', href: '#contact' },
    { name: 'Support', href: '#contact' },
  ];

  return (
    <footer id="contact" className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Connected with the Movement
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Get the latest updates, event notifications, and exclusive opportunities to participate in our movement.
            </p>
            
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">KC</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Dr. Bala Maijama'a Wunti</h2>
                <p className="text-blue-300">Building Tomorrow Together</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Join our movement for transparent governance, sustainable development, and community empowerment. 
              Together, we can build a better future for everyone.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 flex items-center"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 hover:opacity-100 transition-opacity" />
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 flex items-center"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 hover:opacity-100 transition-opacity" />
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Campaign Headquarters, Bauchi, Nigeria</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">+2348060602100, +2348137006617</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">officialbalawunticampaigns@gmail.com</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-gray-300 text-sm"
            >
              © 2024 Bala Wunti Campaign. All rights reserved.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-gray-300 text-sm mt-4 md:mt-0"
            >
              Powered by AV CYBER TECH 
            </motion.p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
