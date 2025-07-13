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
  created_at: string;
  updated_at: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
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
  const [loading, setLoading] = useState(false);
  
  // New image form state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    newUsersThisWeek: 0,
    totalMessages: 0,
    pendingMessages: 0,
    activeImages: 0,
    totalImages: 0
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

  const fetchAllData = async () => {
    await Promise.all([
      fetchGalleryImages(),
      fetchUsers(),
      fetchContactSubmissions()
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
      
      const submissions = data || [];
      setContactSubmissions(submissions);
      
      setAnalytics(prev => ({
        ...prev,
        totalMessages: submissions.length,
        pendingMessages: submissions.length // All messages are "pending" since we don't have a status field
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
        title: "✨ Image Added Successfully",
        description: "Gallery image has been added and is now live.",
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

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'text-blue-500', delay: 0.1 },
            { title: 'New This Week', value: analytics.newUsersThisWeek, icon: UserCheck, color: 'text-green-500', delay: 0.2 },
            { title: 'Gallery Images', value: analytics.totalImages, icon: ImageIcon, color: 'text-purple-500', delay: 0.3 },
            { title: 'Contact Messages', value: analytics.totalMessages, icon: MessageSquare, color: 'text-orange-500', delay: 0.4 }
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
                    <div className={`p-3 rounded-full bg-primary/10 ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
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
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ImageIcon className="w-4 h-4 mr-2" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-primary" />
                      User Management
                    </div>
                    <Badge variant="outline">{users.length} Total Users</Badge>
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts, roles, and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {users.map((user, index) => (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="group hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <span className="text-primary-foreground font-semibold text-sm">
                                      {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.full_name || 'No name'}</p>
                                    <p className="text-sm text-muted-foreground">ID: {user.user_id.slice(0, 8)}...</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{user.email}</TableCell>
                              <TableCell>
                                <select
                                  value={user.role}
                                  onChange={(e) => updateUserRole(user.user_id, e.target.value)}
                                  className="bg-background border border-border rounded px-2 py-1 text-sm"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                  <option value="manager">Manager</option>
                                </select>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteUser(user.user_id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Image URL"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="bg-background/50 border-border"
                      />
                      <Input
                        placeholder="Image Title"
                        value={newImageTitle}
                        onChange={(e) => setNewImageTitle(e.target.value)}
                        className="bg-background/50 border-border"
                      />
                    </div>
                    <Textarea
                      placeholder="Image Caption (will be posted with the image)"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      className="bg-background/50 border-border"
                      rows={3}
                    />
                    <Button
                      onClick={addGalleryImage}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {loading ? 'Adding...' : 'Add Image'}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

            {/* Enhanced Contact Messages */}
            <TabsContent value="messages">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                      Contact Messages
                    </div>
                    <Badge variant="outline">{contactSubmissions.length} Messages</Badge>
                  </CardTitle>
                  <CardDescription>
                    View and manage messages from visitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {contactSubmissions.map((submission, index) => (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-6 bg-background/50 rounded-lg border border-border hover:bg-background/80 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <span className="text-primary-foreground font-semibold text-sm">
                                  {submission.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{submission.name}</h4>
                                <p className="text-sm text-muted-foreground">{submission.email}</p>
                                {submission.phone && (
                                  <p className="text-sm text-muted-foreground">{submission.phone}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-2">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(submission.created_at).toLocaleDateString()}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {new Date(submission.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <p className="text-foreground leading-relaxed">{submission.message}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;