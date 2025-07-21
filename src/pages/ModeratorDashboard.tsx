import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { successToast, errorToast } from '@/components/ui/enhanced-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  LogOut,
  ArrowLeft,
  Activity,
  MessageSquare,
  Crown,
  TrendingUp,
  Users
} from 'lucide-react';

interface UserPost {
  id: string;
  user_id: string;
  post_url: string;
  social_platform: string;
  reward_type: string;
  status: 'pending' | 'approved' | 'rejected';
  earnings: number;
  created_at: string;
  selected_images: string[];
  user_email?: string;
  user_name?: string;
  user_phone?: string;
}

interface Analytics {
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  rejectedPosts: number;
  totalEarnings: number;
}

const ModeratorDashboard = () => {
  const { user, userProfile, signOut, loading: authLoading, isManager, isModerator } = useAuth();
  
  const navigate = useNavigate();
  
  // State management
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    rejectedPosts: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [postSearch, setPostSearch] = useState('');
  const [postFilter, setPostFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && (!user || (!isManager && !isModerator))) {
      navigate('/auth');
      return;
    }
    
    if (user && (isManager || isModerator)) {
      fetchModeratorData();
    }
  }, [user, isManager, isModerator, authLoading, navigate]);

  const fetchModeratorData = async () => {
    setLoading(true);
    try {
      await fetchUserPosts();
    } catch (error) {
      console.error('Error fetching moderator data:', error);
      errorToast(
        "❌ Dashboard Error",
        "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    const { data: posts, error: postsError } = await supabase
      .from('user_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return;
    }

    if (posts) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, phone_number');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setUserPosts(posts as UserPost[]);
        calculateAnalytics(posts as UserPost[]);
        return;
      }

      const postsWithUserInfo = posts.map(post => {
        const userProfile = profiles?.find(p => p.user_id === post.user_id);
        return {
          ...post,
          user_email: userProfile?.email || 'Unknown',
          user_name: userProfile?.full_name || 'Unknown User',
          user_phone: userProfile?.phone_number || 'No phone',
        };
      });

      setUserPosts(postsWithUserInfo as UserPost[]);
      calculateAnalytics(postsWithUserInfo as UserPost[]);
    }
  };

  const calculateAnalytics = (posts: UserPost[]) => {
    const totalPosts = posts.length;
    const pendingPosts = posts.filter(p => p.status === 'pending').length;
    const approvedPosts = posts.filter(p => p.status === 'approved').length;
    const rejectedPosts = posts.filter(p => p.status === 'rejected').length;
    const totalEarnings = posts.reduce((sum, p) => sum + (p.earnings || 0), 0);

    setAnalytics({
      totalPosts,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      totalEarnings
    });
  };

  const updatePostStatus = async (postId: string, newStatus: 'approved' | 'rejected', earnings?: number) => {
    const updateData: any = { status: newStatus };
    if (newStatus === 'approved') {
      updateData.earnings = earnings || 500; // Default earnings
    } else if (newStatus === 'rejected') {
      updateData.earnings = 0; // No earnings for rejected posts
    }

    const { error } = await supabase
      .from('user_posts')
      .update(updateData)
      .eq('id', postId);

    if (error) {
      console.error('Error updating post status:', error);
      errorToast(
        "❌ Update Failed",
        "Failed to update post status"
      );
      return;
    }

    successToast(
      "✅ Post Status Updated!",
      `Post ${newStatus} successfully${newStatus === 'approved' ? ` - ₦${earnings || 500} earnings awarded` : ''}`
    );

    fetchUserPosts();
  };

  // Filter function
  const filteredPosts = userPosts.filter(post => {
    const matchesSearch = 
      (post.user_email?.toLowerCase().includes(postSearch.toLowerCase())) ||
      (post.user_name?.toLowerCase().includes(postSearch.toLowerCase())) ||
      post.post_url.toLowerCase().includes(postSearch.toLowerCase());
    
    const matchesFilter = postFilter === 'all' || post.status === postFilter;
    
    return matchesSearch && matchesFilter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (!isManager && !isModerator)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card/80 backdrop-blur-lg border-b shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Moderator Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Post Management & Analytics</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{userProfile?.full_name}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Moderator
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.totalPosts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.pendingPosts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.approvedPosts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.rejectedPosts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold text-foreground">₦{analytics.totalEarnings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Posts Management */}
          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>User Posts Management</span>
              </CardTitle>
              <CardDescription>
                Review and moderate user posts - approve or reject submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by user name, email, or post URL..."
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <Select value={postFilter} onValueChange={setPostFilter}>
                  <SelectTrigger className="w-[180px] bg-background/50">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border bg-background/50 backdrop-blur overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>User Details</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Social Platform</TableHead>
                      <TableHead>Post Link</TableHead>
                      <TableHead>Reward Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <div className="font-medium">{post.user_name}</div>
                            <div className="text-sm text-muted-foreground">{post.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-primary">
                            {post.user_phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {post.social_platform}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <a 
                            href={post.post_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                          >
                            View Post
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {post.reward_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              post.status === 'pending' ? 'secondary' :
                              post.status === 'approved' ? 'default' : 'destructive'
                            }
                            className={
                              post.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                              post.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                              'bg-red-500/10 text-red-600'
                            }
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>₦{post.earnings || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(post.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {post.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => updatePostStatus(post.id, 'approved', 500)}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updatePostStatus(post.id, 'rejected')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;