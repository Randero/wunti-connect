import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const NewsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching news:', error);
        return;
      }

      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  // Fallback news if no news from database
  const defaultNews = [
    {
      id: '1',
      title: 'Campaign Launch Event Success',
      content: 'Our campaign officially launched with overwhelming support from the community...',
      image_url: 'https://images.unsplash.com/photo-1466442929976-97f336a657be',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Youth Engagement Initiative',
      content: 'Announcing new programs to engage young voters and address their concerns...',
      image_url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22',
      created_at: '2024-01-12T14:30:00Z'
    },
    {
      id: '3',
      title: 'Community Development Plans',
      content: 'Detailed roadmap for infrastructure and economic development in our region...',
      image_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
      created_at: '2024-01-10T09:15:00Z'
    }
  ];

  const newsItems = news.length > 0 ? news : defaultNews;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 rounded-full font-semibold mb-6"
          >
            <Newspaper className="w-5 h-5 mr-2" />
            Latest News
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the latest updates on our campaign progress, events, and policy announcements
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0 overflow-hidden group">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(article.created_at)}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 line-clamp-3 mb-4">
                    {article.content}
                  </CardDescription>
                  
                  <motion.div whileHover={{ x: 5 }}>
                    <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-700 font-semibold">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            className="bg-white hover:bg-gray-50 text-gray-900 border-gray-200 px-8 py-3 rounded-full font-semibold"
          >
            View All News
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;