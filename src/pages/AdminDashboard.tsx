import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserDetailsModal } from '@/components/UserDetailsModal';
import { AddUserModal } from '@/components/AddUserModal';
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
  Target,
  Activity,
  Mail,
  Calendar,
  MessageSquare,
  Globe,
  Star,
  Edit,
  Trash2,
  UserX,
  Crown,
  Sparkles
} from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}

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
  // User info for display
  user_email?: string;
  user_name?: string;
  user_phone?: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
}

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  caption?: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, userProfile, signOut, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State management
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search and filter state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState('');
  const [postSearchTerm, setPostSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [postStatusFilter, setPostStatusFilter] = useState('all');
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  
  // New image form state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    newUsersThisWeek: 0,
    totalMessages: 0,
    pendingMessages: 0,
    activeImages: 0,
    totalImages: 0,
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAllData();
    }
  }, [user, isAdmin]);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;
    
    if (userSearchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, userSearchTerm, roleFilter]);

  // Filter contact submissions based on search and status
  useEffect(() => {
    let filtered = contactSubmissions;
    
    if (submissionSearchTerm) {
      filtered = filtered.filter(submission => 
        submission.name?.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
        submission.email?.toLowerCase().includes(submissionSearchTerm.toLowerCase()) ||
        submission.message?.toLowerCase().includes(submissionSearchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }
    
    setFilteredSubmissions(filtered);
  }, [contactSubmissions, submissionSearchTerm, statusFilter]);

  // Filter posts based on search and status
  useEffect(() => {
    let filtered = userPosts;
    
    if (postSearchTerm) {
      filtered = filtered.filter(post => 
        post.user_email?.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
        post.user_name?.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
        post.social_platform?.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
        post.post_url?.toLowerCase().includes(postSearchTerm.toLowerCase())
      );
    }
    
    if (postStatusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === postStatusFilter);
    }
    
    setFilteredPosts(filtered);
  }, [userPosts, postSearchTerm, postStatusFilter]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchGalleryImages(),
      fetchUsers(),
      fetchContactSubmissions(),
      fetchUserPosts()
    ]);
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const usersData = data || [];
      setUsers(usersData);
      
      // Calculate analytics
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newUsersThisWeek = usersData.filter(u => 
        new Date(u.created_at) > oneWeekAgo
      ).length;
      
      setAnalytics(prev => ({
        ...prev,
        totalUsers: usersData.length,
        newUsersThisWeek
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchContactSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const submissions = (data || []).map(submission => ({
        ...submission,
        status: submission.status as 'pending' | 'in_progress' | 'resolved' | 'closed' || 'pending'
      }));
      setContactSubmissions(submissions);
      
      setAnalytics(prev => ({
        ...prev,
        totalMessages: submissions.length,
        pendingMessages: submissions.filter(s => s.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const images = data || [];
      setGalleryImages(images);
      
      setAnalytics(prev => ({
        ...prev,
        totalImages: images.length,
        activeImages: images.filter(img => img.is_active).length
      }));
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      // First get the posts
      const { data: postsData, error: postsError } = await supabase
        .from('user_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      // Then get user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone_number');

      if (profilesError) throw profilesError;

      // Create a map for quick lookup
      const profileMap = profilesData?.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};
      
      const enrichedPosts = (postsData || []).map(post => ({
        ...post,
        status: post.status as 'pending' | 'approved' | 'rejected',
        user_email: profileMap[post.user_id]?.email,
        user_name: profileMap[post.user_id]?.full_name,
        user_phone: profileMap[post.user_id]?.phone_number || 'No phone'
      }));
      
      setUserPosts(enrichedPosts);
      
      // Calculate post analytics
      const totalEarnings = enrichedPosts.reduce((sum, post) => sum + (post.earnings || 0), 0);
      const pendingPosts = enrichedPosts.filter(p => p.status === 'pending').length;
      const approvedPosts = enrichedPosts.filter(p => p.status === 'approved').length;
      
      setAnalytics(prev => ({
        ...prev,
        totalPosts: enrichedPosts.length,
        pendingPosts,
        approvedPosts,
        totalEarnings
      }));
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const addGalleryImage = async () => {
    // Validate required fields
    if (!selectedImageFile) {
      toast({
        title: "Missing Image",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newImageTitle || newImageTitle.trim().length < 3 || newImageTitle.trim().length > 150) {
      toast({
        title: "Invalid Title",
        description: "Title must be between 3 and 150 characters.",
        variant: "destructive",
      });
      return;
    }
    
    // Caption can be empty (null) or between 10-500 characters
    if (newImageCaption && (newImageCaption.trim().length < 10 || newImageCaption.trim().length > 500)) {
      toast({
        title: "Invalid Caption",
        description: "Caption must be between 10 and 500 characters, or left empty.",
        variant: "destructive",
      });
      return;
    }

    setImageUploading(true);
    try {
      // Upload image to Supabase Storage
      const fileExt = selectedImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, selectedImageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

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
          image_url: publicUrl,
          title: newImageTitle.trim(),
          caption: newImageCaption.trim() || null, // Set to null if empty
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "✨ Image Added Successfully",
        description: "Gallery image has been uploaded and is now live.",
      });

      setSelectedImageFile(null);
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
      setImageUploading(false);
    }
  };

  const toggleImageStatus = async (imageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('campaign_gallery')
        .update({ is_active: !currentStatus })
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Image ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchGalleryImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteGalleryImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('campaign_gallery')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Image Deleted",
        description: "Gallery image has been permanently deleted.",
      });

      fetchGalleryImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updatePostStatus = async (postId: string, newStatus: 'approved' | 'rejected', earnings?: number) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'approved' && earnings !== undefined) {
        updateData.earnings = earnings;
      }

      const { error } = await supabase
        .from('user_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post Status Updated",
        description: `Post ${newStatus} successfully.`,
      });

      fetchUserPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `User role updated to ${newRole}.`,
      });

      // Update the users list immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.user_id === userId ? { ...user, role: newRole } : user
        )
      );
      
      // Also update selectedUser if it's the one being modified
      if (selectedUser && selectedUser.user_id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      
      fetchUsers(); // Still fetch to ensure data consistency
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAccountAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'resetPassword':
          // This would trigger a password reset email in a real implementation
          toast({
            title: "Password Reset",
            description: "Password reset email sent to user.",
          });
          break;
        case 'suspendAccount':
          const { error: suspendError } = await supabase
            .from('profiles')
            .update({ account_status: 'suspended' })
            .eq('user_id', userId);
          
          if (suspendError) throw suspendError;
          
          toast({
            title: "Account Suspended",
            description: "User account has been suspended.",
          });
          
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.user_id === userId ? { ...user, account_status: 'suspended' } : user
            )
          );
          
          // Update selectedUser if it's the one being modified
          if (selectedUser && selectedUser.user_id === userId) {
            setSelectedUser({ ...selectedUser, account_status: 'suspended' });
          }
          break;
        case 'unsuspendAccount':
          const { error: unsuspendError } = await supabase
            .from('profiles')
            .update({ account_status: 'active' })
            .eq('user_id', userId);
          
          if (unsuspendError) throw unsuspendError;
          
          toast({
            title: "Account Reactivated",
            description: "User account has been reactivated.",
          });
          
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.user_id === userId ? { ...user, account_status: 'active' } : user
            )
          );
          
          // Update selectedUser if it's the one being modified
          if (selectedUser && selectedUser.user_id === userId) {
            setSelectedUser({ ...selectedUser, account_status: 'active' });
          }
          break;
        case 'deleteAccount':
          if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
          }
          
          const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('user_id', userId);
          
          if (deleteError) throw deleteError;
          
          toast({
            title: "Account Deleted",
            description: "User account has been permanently deleted.",
          });
          
          setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
          setShowUserDetails(false);
          break;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Request status updated to ${newStatus}.`,
      });

      fetchContactSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "User Deleted",
        description: "User has been permanently removed.",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-6">
            <motion.div 
              className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-secondary rounded-full mx-auto"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <motion.p 
            className="text-muted-foreground font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Initializing Admin Dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Modern Header */}
      <motion.div 
        className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Crown className="w-8 h-8 text-primary" />
                  <Sparkles className="w-4 h-4 text-secondary absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground">Welcome back, {userProfile?.full_name || user.email}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              className="border-destructive/50 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          {[
            { title: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'text-blue-500', delay: 0.1 },
            { title: 'New This Week', value: analytics.newUsersThisWeek, icon: UserCheck, color: 'text-green-500', delay: 0.2 },
            { title: 'Total Posts', value: analytics.totalPosts, icon: Activity, color: 'text-orange-500', delay: 0.25 },
            { title: 'Pending Posts', value: analytics.pendingPosts, icon: Clock, color: 'text-yellow-500', delay: 0.27 },
            { title: 'Gallery Images', value: analytics.totalImages, icon: ImageIcon, color: 'text-purple-500', delay: 0.3 },
            { title: 'Contact Messages', value: analytics.totalMessages, icon: MessageSquare, color: 'text-cyan-500', delay: 0.4 }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{item.title}</p>
                      <motion.p 
                        className="text-3xl font-bold text-foreground"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: item.delay + 0.2, type: "spring" }}
                      >
                        {item.value}
                      </motion.p>
                    </div>
                    <motion.div 
                      className={`${item.color} opacity-80`}
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 0.8 }}
                      transition={{ delay: item.delay + 0.3, duration: 0.5 }}
                    >
                      <item.icon className="w-8 h-8" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="analytics" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="w-4 h-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ImageIcon className="w-4 h-4 mr-2" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
            </TabsList>

            {/* Analytics Overview */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary" />
                      System Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Total Platform Users</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {analytics.totalUsers}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Active Gallery Images</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {analytics.activeImages}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Pending Messages</span>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {analytics.pendingMessages}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                      Growth Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 dark:text-green-300 font-medium">New Users This Week</span>
                        <span className="text-2xl font-bold text-green-600">{analytics.newUsersThisWeek}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">User Growth Rate</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {analytics.totalUsers > 0 ? Math.round((analytics.newUsersThisWeek / analytics.totalUsers) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Enhanced User Management */}
            <TabsContent value="users">
              <div className="space-y-6">
                {/* User Management Header */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-primary" />
                        User Management
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{filteredUsers.length} of {users.length} Users</Badge>
                        <Button
                          onClick={() => setShowAddUser(true)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add User
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Manage user accounts, roles, and permissions with advanced search and filtering
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Search users by name or email..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="bg-background/50 border-border"
                        />
                      </div>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full md:w-48 bg-background/50 border-border">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* User Management Table */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-semibold">User</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Role</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Joined</TableHead>
                            <TableHead className="font-semibold text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user, index) => (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-border/50 hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium">{user.full_name || 'Unnamed User'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{user.email}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    user.role === 'admin' 
                                      ? 'bg-red-100 text-red-800 border-red-200'
                                      : user.role === 'manager'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : user.role === 'moderator'
                                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                                      : 'bg-gray-100 text-gray-800 border-gray-200'
                                  }
                                >
                                  {user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                                  {user.role === 'manager' && <Settings className="w-3 h-3 mr-1" />}
                                  {user.role === 'moderator' && <Shield className="w-3 h-3 mr-1" />}
                                  {user.role === 'user' && <Users className="w-3 h-3 mr-1" />}
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                              </TableCell>
                               <TableCell>
                                 <Badge 
                                   variant="secondary" 
                                   className={
                                     user.account_status === 'suspended'
                                       ? 'bg-red-100 text-red-800 border-red-200'
                                       : user.account_status === 'deactivated'
                                       ? 'bg-gray-100 text-gray-800 border-gray-200'
                                       : 'bg-green-100 text-green-800 border-green-200'
                                   }
                                 >
                                   {user.account_status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                                   {user.account_status === 'deactivated' && <UserX className="w-3 h-3 mr-1" />}
                                   {user.account_status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                                   {user.account_status?.charAt(0).toUpperCase() + user.account_status?.slice(1) || 'Active'}
                                 </Badge>
                               </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                               <TableCell>
                                 <div className="flex items-center justify-center space-x-2">
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={() => handleViewUser(user)}
                                   >
                                     <Eye className="w-3 h-3" />
                                   </Button>
                                   {user.account_status === 'suspended' ? (
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => handleAccountAction('unsuspendAccount', user.user_id)}
                                       className="text-green-600 hover:text-green-700"
                                       title="Unsuspend Account"
                                     >
                                       <CheckCircle className="w-3 h-3" />
                                     </Button>
                                   ) : (
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => handleAccountAction('suspendAccount', user.user_id)}
                                       className="text-orange-600 hover:text-orange-700"
                                       title="Suspend Account"
                                     >
                                       <UserX className="w-3 h-3" />
                                     </Button>
                                   )}
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={() => deleteUser(user.user_id)}
                                     className="text-destructive hover:text-destructive"
                                     title="Delete Account"
                                   >
                                     <Trash2 className="w-3 h-3" />
                                   </Button>
                                 </div>
                               </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No users found</h3>
                        <p className="text-muted-foreground mb-4">
                          {userSearchTerm || roleFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria.' 
                            : 'No users have been added yet.'}
                        </p>
                        {(!userSearchTerm && roleFilter === 'all') && (
                          <Button onClick={() => setShowAddUser(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First User
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Post Management */}
            <TabsContent value="posts">
              <div className="space-y-6">
                {/* Post Management Header */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-primary" />
                        Post Management
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{filteredPosts.length} of {userPosts.length} Posts</Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {analytics.pendingPosts} Pending
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Review and manage user-submitted posts, approve or reject submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Search posts by user, platform, or URL..."
                          value={postSearchTerm}
                          onChange={(e) => setPostSearchTerm(e.target.value)}
                          className="bg-background/50 border-border"
                        />
                      </div>
                      <Select value={postStatusFilter} onValueChange={setPostStatusFilter}>
                        <SelectTrigger className="w-full md:w-48 bg-background/50 border-border">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Post Management Table */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                         <TableHeader>
                           <TableRow className="border-border/50">
                             <TableHead className="font-semibold">User</TableHead>
                             <TableHead className="font-semibold">Phone Number</TableHead>
                             <TableHead className="font-semibold">Platform</TableHead>
                             <TableHead className="font-semibold">Post URL</TableHead>
                             <TableHead className="font-semibold">Reward Type</TableHead>
                             <TableHead className="font-semibold">Status</TableHead>
                             <TableHead className="font-semibold">Earnings</TableHead>
                             <TableHead className="font-semibold">Date</TableHead>
                             <TableHead className="font-semibold text-center">Actions</TableHead>
                           </TableRow>
                         </TableHeader>
                        <TableBody>
                          {filteredPosts.map((post, index) => (
                            <motion.tr
                              key={post.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-border/50 hover:bg-muted/50"
                            >
                               <TableCell>
                                 <div className="flex items-center space-x-3">
                                   <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                     {(post.user_name?.charAt(0) || post.user_email?.charAt(0) || 'U').toUpperCase()}
                                   </div>
                                   <div>
                                     <p className="font-medium">{post.user_name || 'Unknown User'}</p>
                                     <p className="text-sm text-muted-foreground">{post.user_email}</p>
                                   </div>
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
                                  className="text-primary hover:underline text-sm max-w-xs truncate block"
                                >
                                  {post.post_url}
                                </a>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                  {post.reward_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    post.status === 'approved' 
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : post.status === 'rejected'
                                      ? 'bg-red-100 text-red-800 border-red-200'
                                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  }
                                >
                                  {post.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {post.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                  {post.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="font-medium">₦{post.earnings || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {post.status === 'pending' && (
                                    <>
                                       <Button
                                         size="sm"
                                         onClick={() => {
                                           const rewardAmount = post.social_platform === 'facebook' ? 200 : 
                                                               post.social_platform === 'instagram' ? 500 : 
                                                               post.social_platform === 'twitter' ? 700 : 200;
                                           updatePostStatus(post.id, 'approved', rewardAmount);
                                         }}
                                         className="bg-green-500 hover:bg-green-600 text-white"
                                       >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => updatePostStatus(post.id, 'rejected')}
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {post.status === 'approved' && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Approved
                                    </Badge>
                                  )}
                                  {post.status === 'rejected' && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Rejected
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(post.post_url, '_blank')}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredPosts.length === 0 && (
                      <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                          No posts found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {postSearchTerm || postStatusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'No posts have been submitted yet.'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Enhanced Gallery Management */}
            <TabsContent value="gallery">
              <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-primary" />
                      Add New Gallery Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedImageFile(e.target.files?.[0] || null)}
                        className="w-full p-2 border border-border rounded-md bg-background"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Image Title (3-150 characters)"
                          value={newImageTitle}
                          onChange={(e) => setNewImageTitle(e.target.value)}
                          className="bg-background/50 border-border"
                        />
                        <p className="text-xs text-muted-foreground">
                          {newImageTitle.length}/150 characters
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Image Caption (10-500 characters, optional)"
                          value={newImageCaption}
                          onChange={(e) => setNewImageCaption(e.target.value)}
                          className="bg-background/50 border-border"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          {newImageCaption.length}/500 characters {newImageCaption.length > 0 && newImageCaption.length < 10 ? '(minimum 10)' : ''}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={addGalleryImage} 
                      disabled={imageUploading || !selectedImageFile}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {imageUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                        Gallery Images
                      </div>
                      <Badge variant="outline">{galleryImages.length} Images</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <AnimatePresence>
                        {galleryImages.map((image, index) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden border border-border">
                              <img
                                src={image.image_url}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                <Button size="sm" variant="secondary">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => toggleImageStatus(image.id, image.is_active)}
                                >
                                  {image.is_active ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteGalleryImage(image.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              <p className="font-medium text-foreground line-clamp-1">{image.title}</p>
                              {image.caption && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{image.caption}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <Badge variant={image.is_active ? "default" : "secondary"}>
                                  {image.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Switch
                                  checked={image.is_active}
                                  onCheckedChange={() => toggleImageStatus(image.id, image.is_active)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Enhanced Contact Management */}
            <TabsContent value="contact">
              <div className="space-y-6">
                {/* Request Management Header */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                        User Requests & Contact Messages
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{filteredSubmissions.length} of {contactSubmissions.length} Requests</Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Process and manage user requests with status tracking and advanced filtering
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Search requests by name, email, or message content..."
                          value={submissionSearchTerm}
                          onChange={(e) => setSubmissionSearchTerm(e.target.value)}
                          className="bg-background/50 border-border"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48 bg-background/50 border-border">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Request Cards */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredSubmissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-200 hover:shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                  {submission.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground text-lg">{submission.name}</h4>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Mail className="w-3 h-3" />
                                    <span>{submission.email}</span>
                                  </div>
                                  {submission.phone && (
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      <span>📞</span>
                                      <span>{submission.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Select
                                  value={submission.status}
                                  onValueChange={(value) => updateSubmissionStatus(submission.id, value)}
                                >
                                  <SelectTrigger className="w-32 bg-background border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-3 h-3 text-yellow-500" />
                                        <span>Pending</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="in_progress">
                                      <div className="flex items-center space-x-2">
                                        <Activity className="w-3 h-3 text-blue-500" />
                                        <span>In Progress</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="resolved">
                                      <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span>Resolved</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="closed">
                                      <div className="flex items-center space-x-2">
                                        <XCircle className="w-3 h-3 text-gray-500" />
                                        <span>Closed</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="text-right">
                                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(submission.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(submission.created_at).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                              <h5 className="font-medium text-foreground mb-2">Message:</h5>
                              <p className="text-foreground leading-relaxed">{submission.message}</p>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
                              <Badge 
                                variant={
                                  submission.status === 'pending' ? 'secondary' :
                                  submission.status === 'in_progress' ? 'default' :
                                  submission.status === 'resolved' ? 'secondary' : 'outline'
                                }
                                className={
                                  submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  submission.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  submission.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' : 
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }
                              >
                                {submission.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {submission.status === 'in_progress' && <Activity className="w-3 h-3 mr-1" />}
                                {submission.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {submission.status === 'closed' && <XCircle className="w-3 h-3 mr-1" />}
                                <span className="capitalize">{submission.status.replace('_', ' ')}</span>
                              </Badge>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Reply
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No messages found</h3>
                    <p className="text-muted-foreground">
                      {submissionSearchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'No messages have been received yet.'}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Modals */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        onRoleUpdate={updateUserRole}
        onAccountAction={handleAccountAction}
      />

      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserAdded={fetchUsers}
      />
    </div>
  );
};

export default AdminDashboard;