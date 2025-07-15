import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  DollarSign, 
  BarChart3, 
  Trophy,
  Calendar,
  Zap,
  Target,
  CheckCircle,
  Loader2,
  Star
} from 'lucide-react';
import GallerySelector from '@/components/dashboard/GallerySelector';
import SocialMediaPlatforms from '@/components/dashboard/SocialMediaPlatforms';
import PostSubmissionForm from '@/components/dashboard/PostSubmissionForm';
import UserLevelDisplay from '@/components/dashboard/UserLevelDisplay';
import AnalyticsCards from '@/components/dashboard/AnalyticsCards';
import PostHistory from '@/components/dashboard/PostHistory';

interface UserAnalytics {
  total_posts: number;
  total_earnings: number;
  posts_today: number;
  earnings_today: number;
  posts_this_week: number;
  posts_this_month: number;
  earnings_this_week: number;
  earnings_this_month: number;
  last_post_time: string | null;
  next_eligible_post_time: string | null;
}

interface UserLevel {
  current_level: number;
  experience_points: number;
  total_posts: number;
  total_earnings: number;
  next_level_threshold: number;
}

const ModernDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedReward, setSelectedReward] = useState<'airtime' | 'data'>('airtime');
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [canPost, setCanPost] = useState(true);
  const [nextPostCountdown, setNextPostCountdown] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (userAnalytics?.next_eligible_post_time) {
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [userAnalytics]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError;
      }

      // Fetch user level
      const { data: level, error: levelError } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (levelError && levelError.code !== 'PGRST116') {
        throw levelError;
      }

      // Check if user can post
      const { data: canPostData, error: canPostError } = await supabase
        .rpc('can_user_post', { user_id: user?.id });

      if (canPostError) {
        throw canPostError;
      }

      setUserAnalytics(analytics);
      setUserLevel(level);
      setCanPost(canPostData);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!userAnalytics?.next_eligible_post_time) return;
    
    const now = new Date().getTime();
    const nextPost = new Date(userAnalytics.next_eligible_post_time).getTime();
    const difference = nextPost - now;
    
    if (difference > 0) {
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setNextPostCountdown(`${hours}h ${minutes}m ${seconds}s`);
      setCanPost(false);
    } else {
      setNextPostCountdown('');
      setCanPost(true);
    }
  };

  const handleImageSelection = (images: any[]) => {
    setSelectedImages(images);
    if (images.length >= 2) {
      setShowPlatforms(true);
    }
  };

  const handlePlatformSelect = (platform: string, rewardType: 'airtime' | 'data') => {
    setSelectedPlatform(platform);
    setSelectedReward(rewardType);
    setShowPlatforms(false);
    setShowSubmissionForm(true);
  };

  const handlePostSubmission = async (postUrl: string) => {
    try {
      const { error } = await supabase
        .from('user_posts')
        .insert({
          user_id: user?.id,
          selected_images: selectedImages.map(img => img.image_url),
          social_platform: selectedPlatform,
          reward_type: selectedReward,
          post_url: postUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "✨ Submitted Successfully!",
        description: "Go back to your activities and patiently wait as your transaction is being processed",
      });

      // Reset form
      setSelectedImages([]);
      setSelectedPlatform('');
      setShowSubmissionForm(false);
      
      // Refresh user data
      fetchUserData();
      
    } catch (error) {
      console.error('Error submitting post:', error);
      toast({
        title: "Error",
        description: "Failed to submit post",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="relative">
              <motion.h1 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3"
              >
                Welcome Back, Champion! 🚀
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-lg"
              >
                Your ultra-modern campaign command center
              </motion.p>
              <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-ping"></div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-75 animate-pulse"></div>
              <Badge className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xl px-6 py-3 font-bold border-0">
                <Trophy className="h-5 w-5 mr-2" />
                Level {userLevel?.current_level || 1}
              </Badge>
            </motion.div>
          </div>

          {/* User Level Display */}
          {userLevel && <UserLevelDisplay userLevel={userLevel} />}
        </motion.div>

        {/* Analytics Cards */}
        {userAnalytics && (
          <AnalyticsCards 
            analytics={userAnalytics} 
            canPost={canPost}
            nextPostCountdown={nextPostCountdown}
          />
        )}

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="gallery" className="text-lg">
                🎯 Post Campaign
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-lg">
                📊 Analytics
              </TabsTrigger>
              <TabsTrigger value="history" className="text-lg">
                📝 Post History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gallery">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
                <CardContent className="p-8">
                  {!canPost ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Next Post Available In:</h3>
                      <div className="text-4xl font-mono font-bold text-primary mb-4">
                        {nextPostCountdown}
                      </div>
                      <p className="text-muted-foreground">
                        You can only post once every 24 hours to maintain quality
                      </p>
                    </motion.div>
                  ) : (
                    <GallerySelector
                      selectedImages={selectedImages}
                      onImageSelection={handleImageSelection}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Detailed Analytics</h3>
                  {userAnalytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <BarChart3 className="h-8 w-8 text-primary" />
                          <Badge variant="outline">This Month</Badge>
                        </div>
                        <div className="text-3xl font-bold">{userAnalytics.total_posts}</div>
                        <p className="text-muted-foreground">Total Posts</p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <DollarSign className="h-8 w-8 text-green-500" />
                          <Badge variant="outline">Earnings</Badge>
                        </div>
                        <div className="text-3xl font-bold">${userAnalytics.total_earnings}</div>
                        <p className="text-muted-foreground">Total Earned</p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Trophy className="h-8 w-8 text-blue-500" />
                          <Badge variant="outline">Achievement</Badge>
                        </div>
                        <div className="text-3xl font-bold">Level {userLevel?.current_level || 1}</div>
                        <p className="text-muted-foreground">Current Level</p>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <PostHistory />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showPlatforms && (
            <SocialMediaPlatforms
              onSelect={handlePlatformSelect}
              onClose={() => setShowPlatforms(false)}
              selectedImages={selectedImages}
            />
          )}

          {showSubmissionForm && (
            <PostSubmissionForm
              platform={selectedPlatform}
              rewardType={selectedReward}
              onSubmit={handlePostSubmission}
              onClose={() => setShowSubmissionForm(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernDashboard;