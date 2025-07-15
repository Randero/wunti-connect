import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Image as ImageIcon, 
  Share2, 
  DollarSign, 
  Facebook, 
  Instagram, 
  Twitter,
  LogOut,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  TrendingUp,
  Target,
  Wallet,
  Gift,
  Smartphone,
  Wifi,
  BarChart3,
  Activity,
  Users,
  Calendar,
  Star,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [rewardType, setRewardType] = useState<'airtime' | 'data' | ''>('');
  const [postUrl, setPostUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalEarnings: 0,
    postsSubmitted: 0,
    approvedPosts: 0,
    pendingReviews: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchGalleryImages();
      fetchUserAnalytics();
    }
  }, [user]);

  const [userPosts, setUserPosts] = useState<any[]>([]);

  const fetchUserAnalytics = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('user_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user posts:', error);
        return;
      }

      setUserPosts(posts || []);
      
      // Update analytics
      const totalEarnings = posts?.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.earnings || 0), 0) || 0;
      const approvedPosts = posts?.filter(p => p.status === 'approved').length || 0;
      const pendingPosts = posts?.filter(p => p.status === 'pending').length || 0;
      
      setAnalytics({
        totalEarnings,
        postsSubmitted: posts?.length || 0,
        approvedPosts,
        pendingReviews: pendingPosts
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_gallery')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery:', error);
        return;
      }

      setGalleryImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const handleImageSelection = (image: any) => {
    if (selectedImages.length < 2) {
      setSelectedImages([...selectedImages, image]);
    } else {
      setSelectedImages([selectedImages[1], image]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleShowPlatforms = () => {
    if (selectedImages.length === 2) {
      setShowPlatformDialog(true);
    } else {
      toast({
        title: "Select Images",
        description: "Please select exactly 2 images from the gallery.",
        variant: "destructive",
      });
    }
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setShowPlatformDialog(false);
    setShowRewardDialog(true);
  };

  const handleRewardSelect = (type: 'airtime' | 'data') => {
    setRewardType(type);
    // Don't close the dialog immediately, keep it open so user can see the Post button
  };

  const handlePost = () => {
    if (!selectedPlatform || !rewardType) return;
    
    // Open social media app with selected images
    openSocialMediaPost(selectedPlatform, selectedImages);
    
    toast({
      title: "Redirecting...",
      description: `Opening ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} to post your content.`,
    });
  };

  const handleSubmitPost = async () => {
    if (!postUrl || !selectedPlatform || !rewardType || selectedImages.length !== 2) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields and select 2 images.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_posts')
        .insert({
          user_id: user.id,
          post_url: postUrl,
          social_platform: selectedPlatform,
          reward_type: rewardType,
          selected_images: selectedImages.map(img => img.image_url),
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting post:', error);
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Post Submitted Successfully!",
        description: "Your post is now under review by our moderators. Check your post history for updates.",
      });

      // Reset form
      setSelectedImages([]);
      setSelectedPlatform('');
      setRewardType('');
      setPostUrl('');
      
      // Refresh analytics
      await fetchUserAnalytics();
      
    } catch (error) {
      console.error('Error submitting post:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      default: return Share2;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const downloadImage = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadAllSelectedImages = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select images first to download them.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Downloading Images",
      description: `Downloading ${selectedImages.length} images...`,
    });

    for (const image of selectedImages) {
      await downloadImage(image.image_url, image.title);
      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast({
      title: "Download Complete!",
      description: `Successfully downloaded ${selectedImages.length} images.`,
    });
  };

  const openSocialMediaPost = (platform: string, selectedImages: any[]) => {
    const campaignText = 'Supporting Engr. Aliyu Muhammed Cambat for positive change! #AliyuCambat #Vote2024';
    
    // Create image descriptions for the caption
    const imageDescriptions = selectedImages.map((img, index) => 
      `Image ${index + 1}: ${img.title}${img.caption ? ` - ${img.caption}` : ''}`
    ).join('\n\n');
    
    // Create comprehensive caption with image info
    const suggestedCaption = `${campaignText}\n\n${imageDescriptions}\n\nJoin the movement for positive change in our community! 🇳🇬\n\n#AliyuCambat #Vote2024 #Leadership #Change #Community`;
    
    let url = '';
    let instructions = '';
    
    switch (platform) {
      case 'facebook':
        url = 'https://www.facebook.com/';
        instructions = 'Create a new post, upload your downloaded images, and paste the caption';
        break;
      case 'instagram':
        url = 'https://www.instagram.com/';
        instructions = 'Create a new post, upload your downloaded images, and paste the caption';
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(campaignText)}`;
        instructions = 'Upload your downloaded images and complete your tweet';
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(suggestedCaption)}`;
        instructions = 'Share the message with your contacts';
        break;
      case 'linkedin':
        url = 'https://www.linkedin.com/sharing/share-offsite/';
        instructions = 'Create a new post, upload your downloaded images, and paste the caption';
        break;
    }

    // First download all images
    downloadAllSelectedImages().then(() => {
      // Copy caption to clipboard
      navigator.clipboard.writeText(suggestedCaption).then(() => {
        toast({
          title: "Ready to Post!",
          description: `Images downloaded & caption copied. ${instructions}`,
          duration: 8000,
        });
      });

      // Open the platform after a brief delay to allow downloads to complete
      setTimeout(() => {
        window.open(url, '_blank');
        
        // Show helpful instructions
        setTimeout(() => {
          toast({
            title: "Post Now!",
            description: "1. Check your Downloads folder for images\n2. Upload the images to your post\n3. Paste the caption\n4. Share and copy the post URL back here",
            duration: 15000,
          });
        }, 2000);
      }, 1000);
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ultra Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {userProfile?.full_name || user.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold">₦{analytics.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-blue-100 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Posts Submitted</p>
                  <p className="text-3xl font-bold">{analytics.postsSubmitted}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Share2 className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-green-100 text-sm">
                <Activity className="w-4 h-4 mr-1" />
                <span>Total posts shared</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Approved Posts</p>
                  <p className="text-3xl font-bold">{analytics.approvedPosts}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-purple-100 text-sm">
                <Target className="w-4 h-4 mr-1" />
                <span>Earning rewards</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pending Reviews</p>
                  <p className="text-3xl font-bold">{analytics.pendingReviews}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-orange-100 text-sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                <span>Awaiting approval</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="gallery" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>Gallery & Post</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Post History</span>
            </TabsTrigger>
          </TabsList>

          {/* Gallery & Post Tab */}
          <TabsContent value="gallery" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <ImageIcon className="w-6 h-6" />
                    <span>Select 2 Images for Social Media Post</span>
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Choose exactly 2 images from our campaign gallery to create your social media post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {galleryImages.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery images available</h3>
                      <p className="text-gray-600">Gallery images will appear here once added by administrators</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {galleryImages.map((image) => {
                        const isSelected = selectedImages.some(selected => selected.id === image.id);
                        return (
                          <motion.div
                            key={image.id}
                            onClick={() => handleImageSelection(image)}
                            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                              isSelected
                                ? 'border-blue-500 shadow-lg scale-105'
                                : selectedImages.length >= 2 
                                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-gray-300'
                            }`}
                            whileHover={{ scale: isSelected ? 1.05 : selectedImages.length >= 2 ? 1 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="aspect-square relative">
                              <img
                                src={image.image_url}
                                alt={image.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Image failed to load:', image.image_url);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                    {selectedImages.findIndex(selected => selected.id === image.id) + 1}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium text-gray-900 text-sm truncate">{image.title}</h4>
                              {image.caption && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{image.caption}</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Images Preview */}
                  {selectedImages.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Selected Images ({selectedImages.length}/2)</h3>
                      <div className="flex space-x-4">
                        {selectedImages.map((image, index) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.image_url}
                              alt={image.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeSelectedImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleShowPlatforms}
                    disabled={selectedImages.length !== 2}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Continue to Social Media Selection
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit URL Section */}
            {selectedPlatform && rewardType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="w-6 h-6" />
                      <span>Submit Your Post</span>
                    </CardTitle>
                    <CardDescription>
                      Paste the URL of your posted content to claim your {rewardType} reward
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post URL (After posting on {selectedPlatform}, paste the link here) *
                      </label>
                      <input
                        type="url"
                        value={postUrl}
                        onChange={(e) => setPostUrl(e.target.value)}
                        placeholder={`https://${selectedPlatform}.com/...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Copy the exact URL of your {selectedPlatform} post and paste it here
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Submission Guidelines:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Post both selected images with their captions</li>
                        <li>• Include hashtags: #AliyuCambat #Vote2024 #PositiveChange</li>
                        <li>• Copy the post link immediately after posting</li>
                        <li>• Your submission will be reviewed within 24 hours</li>
                        <li>• Reward after approval: {rewardType === 'airtime' ? '₦500 Airtime' : '2GB Data'}</li>
                      </ul>
                      
                      {selectedImages.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                          <h5 className="font-medium text-gray-900 mb-3">Suggested Post Content:</h5>
                          {selectedImages.map((image, index) => (
                            <div key={image.id} className="mb-2">
                              <p className="text-sm font-medium text-blue-700">Image {index + 1}: {image.title}</p>
                              <p className="text-sm text-gray-700 italic">"{image.caption || 'No caption available'}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmitPost}
                      disabled={loading || !postUrl}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl shadow-lg"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Submit for {rewardType === 'airtime' ? 'Airtime' : 'Data'} Reward
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6" />
                    <span>Performance Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-700">Approval Rate</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {analytics.postsSubmitted > 0 ? Math.round((analytics.approvedPosts / analytics.postsSubmitted) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-700">Average Earnings per Post</span>
                      <span className="text-2xl font-bold text-green-600">₦500</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-700">This Month's Posts</span>
                      <span className="text-2xl font-bold text-purple-600">{analytics.postsSubmitted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-6 h-6" />
                    <span>Community Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                      <span className="font-medium text-orange-700">Reach Score</span>
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-orange-500" />
                        <span className="text-2xl font-bold text-orange-600">4.8</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-700">Engagement Level</span>
                      <span className="text-2xl font-bold text-red-600">High</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                      <span className="font-medium text-indigo-700">Campaign Contribution</span>
                      <span className="text-2xl font-bold text-indigo-600">Elite</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Post History Tab */}
          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Your Post History</CardTitle>
                  <CardDescription>
                    Track your submitted posts and earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-600 mb-6">Start sharing campaign content to earn rewards!</p>
                      <Button onClick={() => setSelectedImages([])} variant="outline">
                        Share Your First Post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPosts.map((post) => {
                        const StatusIcon = getStatusIcon(post.status);
                        const PlatformIcon = getPlatformIcon(post.social_platform);
                        return (
                          <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <PlatformIcon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 capitalize">{post.social_platform}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(post.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge className={`${getStatusColor(post.status)} font-medium`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                              </Badge>
                              {post.status === 'approved' && (
                                <div className="text-green-600 font-semibold">
                                  +₦{post.earnings || 500}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Social Media Platform Selection Dialog */}
        <Dialog open={showPlatformDialog} onOpenChange={setShowPlatformDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Choose Social Media Platform</DialogTitle>
              <DialogDescription className="text-center">
                Select where you want to share your post
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              {[
                { name: 'facebook', icon: Facebook, color: 'bg-blue-600', label: 'Facebook' },
                { name: 'instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500', label: 'Instagram' },
                { name: 'twitter', icon: Twitter, color: 'bg-blue-400', label: 'Twitter' }
              ].map((platform) => {
                const PlatformIcon = platform.icon;
                return (
                  <motion.button
                    key={platform.name}
                    onClick={() => handlePlatformSelect(platform.name)}
                    className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center`}>
                      <PlatformIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{platform.label}</h3>
                      <p className="text-sm text-gray-600">Share on {platform.label}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Reward Type Selection Dialog */}
        <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center space-x-2">
                <Gift className="w-6 h-6 text-purple-600" />
                <span>Choose Your Reward</span>
              </DialogTitle>
              <DialogDescription className="text-center">
                Select your preferred reward type to continue
              </DialogDescription>
            </DialogHeader>
            
            <motion.div 
              className="grid grid-cols-1 gap-4 py-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, staggerChildren: 0.1 }}
            >
              <motion.button
                onClick={() => handleRewardSelect('airtime')}
                className={`group flex items-center space-x-4 p-6 rounded-xl border-2 transition-all duration-300 transform ${
                  rewardType === 'airtime' 
                    ? 'border-green-500 bg-green-50 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md'
                }`}
                whileHover={{ scale: rewardType === 'airtime' ? 1.05 : 1.03 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.div 
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    rewardType === 'airtime' 
                      ? 'bg-green-600 shadow-lg' 
                      : 'bg-green-500 group-hover:bg-green-600 group-hover:shadow-lg'
                  }`}
                  whileHover={{ rotate: 5 }}
                >
                  <Smartphone className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-left flex-1">
                  <h3 className={`font-bold text-lg transition-colors ${
                    rewardType === 'airtime' ? 'text-green-700' : 'text-gray-900 group-hover:text-green-700'
                  }`}>
                    Airtime Reward
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors">
                    ₦500 Mobile Credit
                  </p>
                </div>
                {rewardType === 'airtime' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>

              <motion.button
                onClick={() => handleRewardSelect('data')}
                className={`group flex items-center space-x-4 p-6 rounded-xl border-2 transition-all duration-300 transform ${
                  rewardType === 'data' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                }`}
                whileHover={{ scale: rewardType === 'data' ? 1.05 : 1.03 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <motion.div 
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    rewardType === 'data' 
                      ? 'bg-blue-600 shadow-lg' 
                      : 'bg-blue-500 group-hover:bg-blue-600 group-hover:shadow-lg'
                  }`}
                  whileHover={{ rotate: -5 }}
                >
                  <Wifi className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-left flex-1">
                  <h3 className={`font-bold text-lg transition-colors ${
                    rewardType === 'data' ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'
                  }`}>
                    Data Reward
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                    2GB Internet Data
                  </p>
                </div>
                {rewardType === 'data' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            </motion.div>
            
            {/* Selection Indicator */}
            <AnimatePresence>
              {rewardType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    rewardType === 'airtime' 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-5 h-5 ${
                      rewardType === 'airtime' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                    <span className={`font-medium ${
                      rewardType === 'airtime' ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {rewardType === 'airtime' ? 'Airtime' : 'Data'} reward selected!
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    rewardType === 'airtime' ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    You'll receive {rewardType === 'airtime' ? '₦500 mobile credit' : '2GB internet data'} after your post is approved.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Action Button */}
            <AnimatePresence>
              {selectedPlatform && rewardType && (
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => {
                        handlePost();
                        setShowRewardDialog(false);
                      }}
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Post on {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} & Earn {rewardType === 'airtime' ? 'Airtime' : 'Data'}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Requirement Notice */}
            {!rewardType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4"
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800 font-medium text-sm">
                    Please select your preferred reward type to continue
                  </span>
                </div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;