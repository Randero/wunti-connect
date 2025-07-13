import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Users, 
  Image as ImageIcon, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Upload,
  DollarSign,
  BarChart3,
  UserCheck,
  Settings,
  Eye,
  LogOut,
  ArrowLeft,
  Target
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, userProfile, signOut, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPosts();
      fetchAnalytics();
      fetchGalleryImages();
      fetchUsers();
    }
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_posts')
        .select(`
          *,
          profiles!user_id(full_name),
          campaign_gallery!gallery_image_id(title, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .single();

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const updatePostStatus = async (postId: string, status: 'approved' | 'rejected', rewardAmount?: number) => {
    setLoading(true);
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved' && rewardAmount) {
        updateData.reward_amount = rewardAmount;
        updateData.is_rewarded = true;
      }

      const { error } = await supabase
        .from('user_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: `Post ${status}`,
        description: `Post has been ${status} successfully.`,
      });

      fetchPosts();
      fetchAnalytics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGalleryImage = async () => {
    if (!newImageUrl || !newImageTitle || !newImageCaption) {
      toast({
        title: "Missing Information",
        description: "Please provide image URL, title, and caption.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get the active campaign
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('is_active', true)
        .limit(1);

      if (campaignError || !campaigns?.length) {
        throw new Error('No active campaign found');
      }

      const { error } = await supabase
        .from('campaign_gallery')
        .insert({
          campaign_id: campaigns[0].id,
          image_url: newImageUrl,
          title: newImageTitle,
          caption: newImageCaption,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Image Added",
        description: "Gallery image has been added successfully.",
      });

      setNewImageUrl('');
      setNewImageTitle('');
      setNewImageCaption('');
      fetchGalleryImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-blue-400" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-300">Welcome, {userProfile?.full_name || user.email}</p>
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Posts</p>
                      <p className="text-2xl font-bold text-white">{analytics.total_posts}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Rewards</p>
                      <p className="text-2xl font-bold text-white">₦{analytics.total_rewards || 0}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Approved Posts</p>
                      <p className="text-2xl font-bold text-white">{analytics.approved_posts}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Pending Posts</p>
                      <p className="text-2xl font-bold text-white">{analytics.pending_posts}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        <Tabs defaultValue="posts" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-md border-white/10">
            <TabsTrigger value="posts" className="data-[state=active]:bg-white/10 text-gray-300">
              <UserCheck className="w-4 h-4 mr-2" />
              Manage Posts
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-white/10 text-gray-300">
              <ImageIcon className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/10 text-gray-300">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 text-gray-300">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Posts Management */}
          <TabsContent value="posts">
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Post Submissions</CardTitle>
                <CardDescription className="text-gray-400">
                  Review and approve user submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => {
                    const StatusIcon = getStatusIcon(post.status);
                    return (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden">
                            <img
                              src={post.campaign_gallery.image_url}
                              alt={post.campaign_gallery.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{post.profiles?.full_name}</h4>
                            <p className="text-sm text-gray-400 capitalize">{post.platform}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                            <a
                              href={post.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              View Post
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(post.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {post.status}
                          </Badge>
                          
                          {post.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => updatePostStatus(post.id, 'approved', 500)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve (₦500)
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updatePostStatus(post.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {post.is_rewarded && (
                            <div className="text-green-400 font-semibold">
                              ₦{post.reward_amount}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Management */}
          <TabsContent value="gallery">
            <div className="space-y-6">
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Add New Gallery Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                  <Input
                    placeholder="Image Title"
                    value={newImageTitle}
                    onChange={(e) => setNewImageTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                  <Textarea
                    placeholder="Image Caption (will be posted with the image)"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    rows={3}
                  />
                  <Button
                    onClick={addGalleryImage}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? 'Adding...' : 'Add Image'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Gallery Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden">
                          <img
                            src={image.image_url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-white font-medium">{image.title}</p>
                          {image.caption && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{image.caption}</p>
                          )}
                          <Badge variant={image.is_active ? "default" : "secondary"} className="mt-1">
                            {image.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage user accounts and oversee supporter activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.full_name?.charAt(0) || user.email?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{user.full_name || 'No name'}</h4>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          {user.phone && (
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.is_admin ? "default" : "secondary"}>
                          {user.is_admin ? "Admin" : "Supporter"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/dashboard?user=${user.id}`)}
                          className="border-blue-500/50 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Dashboard
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white/5 rounded-xl">
                      <h3 className="text-lg font-semibold text-white mb-2">Facebook</h3>
                      <p className="text-3xl font-bold text-blue-400">{analytics.facebook_posts}</p>
                      <p className="text-sm text-gray-400">Total Posts</p>
                    </div>
                    <div className="text-center p-6 bg-white/5 rounded-xl">
                      <h3 className="text-lg font-semibold text-white mb-2">Instagram</h3>
                      <p className="text-3xl font-bold text-pink-400">{analytics.instagram_posts}</p>
                      <p className="text-sm text-gray-400">Total Posts</p>
                    </div>
                    <div className="text-center p-6 bg-white/5 rounded-xl">
                      <h3 className="text-lg font-semibold text-white mb-2">Twitter</h3>
                      <p className="text-3xl font-bold text-cyan-400">{analytics.twitter_posts}</p>
                      <p className="text-sm text-gray-400">Total Posts</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;