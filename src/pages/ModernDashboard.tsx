import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
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
  Star,
  LogOut,
  Sparkles
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
  const navigate = useNavigate();
  
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 md:w-80 md:h-80 md:-top-40 md:-right-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 md:w-80 md:h-80 md:-bottom-40 md:-left-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 left-20 w-40 h-40 md:w-80 md:h-80 md:top-40 md:left-40 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-3 md:px-4 py-4 md:py-8 space-y-4 md:space-y-6">
        {/* Header with Sign Out */}
        <div className="flex justify-between items-start">
          <div className="text-center flex-1 space-y-2 md:space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 animate-pulse" />
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Campaign Dashboard
              </h1>
            </div>
            <p className="text-gray-300 text-sm md:text-lg">
              Share campaign content and earn rewards
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="ml-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        {/* Analytics Overview - Moved to top */}
        {userAnalytics && (
          <AnalyticsCards 
            analytics={userAnalytics} 
            canPost={canPost}
            nextPostCountdown={nextPostCountdown}
          />
        )}

        {/* User Level Display */}
        {userLevel && <UserLevelDisplay userLevel={userLevel} />}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
              <TabsTrigger value="gallery" className="text-xs md:text-sm py-2 md:py-3">
                <span className="md:hidden">🎯 Post</span>
                <span className="hidden md:inline">🎯 Post Campaign</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm py-2 md:py-3">
                <span className="md:hidden">📊 Stats</span>
                <span className="hidden md:inline">📊 Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs md:text-sm py-2 md:py-3">
                <span className="md:hidden">📝 History</span>
                <span className="hidden md:inline">📝 Post History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gallery">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
                <CardContent className="p-4 md:p-8">
                  {!canPost ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 md:py-12"
                    >
                      <Clock className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl md:text-2xl font-bold mb-2">Next Post Available In:</h3>
                      <div className="text-2xl md:text-4xl font-mono font-bold text-primary mb-4">
                        {nextPostCountdown}
                      </div>
                      <p className="text-muted-foreground text-sm md:text-base">
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
                <CardContent className="p-4 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold mb-6">Detailed Analytics</h3>
                  {userAnalytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                          <Badge variant="outline" className="text-xs">This Month</Badge>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold">{userAnalytics.total_posts}</div>
                        <p className="text-muted-foreground text-sm">Total Posts</p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                          <Badge variant="outline" className="text-xs">Earnings</Badge>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold">${userAnalytics.total_earnings}</div>
                        <p className="text-muted-foreground text-sm">Total Earned</p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Trophy className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                          <Badge variant="outline" className="text-xs">Achievement</Badge>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold">Level {userLevel?.current_level || 1}</div>
                        <p className="text-muted-foreground text-sm">Current Level</p>
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