import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Send, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { successToast, errorToast } from '@/components/ui/enhanced-toast';
import { supabase } from '@/integrations/supabase/client';

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Client-side input validation
  const validateInput = () => {
    const errors: string[] = [];
    
    // Name validation
    if (!formData.name.trim() || formData.name.length < 2 || formData.name.length > 100) {
      errors.push("Name must be between 2 and 100 characters");
    }
    
    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    
    // Phone validation (if provided)
    if (formData.phone && !/^[\+]?[0-9\-\(\)\s]{7,20}$/.test(formData.phone)) {
      errors.push("Please enter a valid phone number");
    }
    
    // Message validation
    if (!formData.message.trim() || formData.message.length < 10 || formData.message.length > 2000) {
      errors.push("Message must be between 10 and 2000 characters");
    }
    
    // Check for potentially malicious content
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i
    ];
    
    const allText = `${formData.name} ${formData.email} ${formData.message}`;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(allText)) {
        errors.push("Your message contains invalid characters. Please remove any HTML or scripts.");
        break;
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Client-side validation
      const validationErrors = validateInput();
      if (validationErrors.length > 0) {
        errorToast(
          "⚠️ Validation Error",
          validationErrors[0]
        );
        setLoading(false);
        return;
      }

      // Sanitize inputs (basic client-side sanitization)
      const sanitizedData = {
        name: formData.name.trim().substring(0, 100),
        email: formData.email.trim().toLowerCase().substring(0, 254),
        phone: formData.phone ? formData.phone.trim().substring(0, 20) : null,
        message: formData.message.trim().substring(0, 2000)
      };

      // Save to database with rate limiting check
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          ...sanitizedData,
          ip_address: null, // Will be handled server-side
          user_agent: navigator.userAgent.substring(0, 500) // Limit user agent length
        });

      if (error) {
        // Check if it's a rate limiting error
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          errorToast(
            "⚠️ Rate Limit Exceeded",
            "You've submitted too many messages recently. Please wait before trying again."
          );
          setLoading(false);
          return;
        }
        throw error;
      }

      successToast(
        "🎉 Message Sent!",
        "Thank you for reaching out. We'll get back to you soon."
      );

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      
      // Don't expose internal errors to users
      let errorMessage = "Failed to send message. Please try again.";
      
      if (error.message.includes('constraint')) {
        if (error.message.includes('email')) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message.includes('name_length')) {
          errorMessage = "Name must be between 2 and 100 characters.";
        } else if (error.message.includes('message_length')) {
          errorMessage = "Message must be between 10 and 2000 characters.";
        } else if (error.message.includes('phone_format')) {
          errorMessage = "Please enter a valid phone number.";
        }
      }
      
      errorToast(
        "❌ Error Sending Message",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      value: '+234 (0) 123 456 7890',
      description: 'Available 24/7'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@aliyucambat.com',
      description: 'Response within 24hrs'
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Campaign Headquarters',
      description: 'Abuja, Nigeria'
    }
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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 text-green-600 rounded-full font-semibold mb-6"
          >
            <Send className="w-5 h-5 mr-2" />
            Get in Touch
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact Our Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions, suggestions, or want to get involved? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Let's Connect</h3>
              <p className="text-lg text-gray-600 mb-8">
                Reach out to us through any of the following channels. We're here to listen and help.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                  className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h4>
                    <p className="text-blue-600 font-medium mb-1">{info.value}</p>
                    <p className="text-gray-500 text-sm">{info.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Card className="shadow-2xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Send us a Message</CardTitle>
                <CardDescription className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+234 (0) 123 456 7890"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg"
                    >
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;