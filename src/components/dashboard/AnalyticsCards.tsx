import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock,
  BarChart3,
  Target,
  Zap,
  CheckCircle
} from 'lucide-react';

interface UserAnalytics {
  total_posts: number;
  total_earnings: number;
  posts_today: number;
  earnings_today: number;
  posts_this_week: number;
  posts_this_month: number;
  earnings_this_week: number;
  earnings_this_month: number;
}

interface AnalyticsCardsProps {
  analytics: UserAnalytics;
  canPost: boolean;
  nextPostCountdown: string;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ 
  analytics, 
  canPost, 
  nextPostCountdown 
}) => {
  const cards = [
    {
      title: 'Posts Today',
      value: analytics.posts_today,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      change: '+2 this week',
      trend: 'up'
    },
    {
      title: 'Today\'s Earnings',
      value: `$${analytics.earnings_today.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      change: `$${analytics.earnings_this_week.toFixed(2)} this week`,
      trend: 'up'
    },
    {
      title: 'Total Posts',
      value: analytics.total_posts,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      change: `${analytics.posts_this_month} this month`,
      trend: 'neutral'
    },
    {
      title: 'Next Post',
      value: canPost ? 'Available Now' : nextPostCountdown,
      icon: canPost ? CheckCircle : Clock,
      color: canPost ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600',
      bgColor: canPost ? 'bg-green-50' : 'bg-orange-50',
      borderColor: canPost ? 'border-green-200' : 'border-orange-200',
      change: '24h cooldown',
      trend: canPost ? 'up' : 'neutral'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${card.bgColor} ${card.borderColor} border-2 overflow-hidden relative`}>
              <CardContent className="p-3 md:p-6">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${card.color} rounded-full transform translate-x-4 -translate-y-4 md:translate-x-6 md:-translate-y-6`} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                    
                    {card.trend === 'up' && (
                      <Badge variant="secondary" className="bg-white/50 text-green-700 border-green-200 text-xs hidden md:flex">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span className="hidden lg:inline">Growing</span>
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
                      {card.title}
                    </h3>
                    
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                      className="text-lg md:text-3xl font-bold"
                    >
                      {card.value}
                    </motion.div>
                    
                    <p className="text-xs text-muted-foreground hidden md:block">
                      {card.change}
                    </p>
                  </div>
                </div>

                {/* Animated Background Elements */}
                <motion.div
                  animate={{ 
                    x: [0, 10, 0],
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-2 right-2 w-2 h-2 bg-white/30 rounded-full"
                />
                
                <motion.div
                  animate={{ 
                    x: [0, -8, 0],
                    y: [0, 8, 0],
                  }}
                  transition={{ 
                    duration: 4 + index,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-4 right-8 w-1 h-1 bg-white/40 rounded-full"
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AnalyticsCards;