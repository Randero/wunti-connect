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
import { successToast, errorToast } from '@/components/ui/enhanced-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Image as ImageIcon, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Upload,
  DollarSign,
  Eye,
  LogOut,
  ArrowLeft,
  Activity,
  Mail,
  MessageSquare,
  Globe,
  Star,
  Edit,
  Trash2,
  Sparkles,
  Crown
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

const ModeratorDashboard = () => {
  const { user, userProfile, signOut, loading: authLoading, isManager } = useAuth();
  
  const navigate = useNavigate();
  
  // State management
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [messageSearch, setMessageSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [postFilter, setPostFilter] = useState('all');
  const [messageFilter, setMessageFilter] = useState('all');
  
  // File upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isManager)) {
      navigate('/auth');
      return;
    }
    
    if (user && isManager) {
      fetchModeratorData();
    }
  }, [user, isManager, authLoading, navigate]);

  const fetchModeratorData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchContactSubmissions(),
        fetchGalleryImages(),
        fetchUserPosts()
      ]);
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

  const fetchContactSubmissions = async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact submissions:', error);
      return;
    }

    setContactSubmissions(data as ContactSubmission[] || []);
  };

  const fetchGalleryImages = async () => {
    const { data, error } = await supabase
      .from('campaign_gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gallery images:', error);
      return;
    }

    setGalleryImages(data || []);
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
    }
  };

  const addGalleryImage = async () => {
    if (!selectedFile || !newImageTitle.trim()) {
      errorToast(
        "⚠️ Missing Information",
        "Please select a file and enter a title"
      );
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('campaign_gallery')
        .insert([
          {
            title: newImageTitle.trim(),
            caption: newImageCaption.trim() || null,
            image_url: publicUrl,
            is_active: true
          }
        ]);

      if (insertError) throw insertError;

      successToast(
        "🎉 Image Added Successfully!",
        "Image added to gallery successfully"
      );

      setNewImageTitle('');
      setNewImageCaption('');
      setSelectedFile(null);
      fetchGalleryImages();
    } catch (error) {
      console.error('Error adding gallery image:', error);
      errorToast(
        "❌ Upload Failed",
        "Failed to add image to gallery"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleImageStatus = async (imageId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('campaign_gallery')
      .update({ is_active: !currentStatus })
      .eq('id', imageId);

    if (error) {
      console.error('Error updating image status:', error);
      errorToast(
        "❌ Update Failed",
        "Failed to update image status"
      );
      return;
    }

    successToast(
      "✅ Status Updated!",
      `Image ${!currentStatus ? 'activated' : 'deactivated'} successfully`
    );

    fetchGalleryImages();
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
      "🎉 Post Status Updated!",
      `Post ${newStatus} successfully${newStatus === 'approved' ? ` - ₦${earnings || 500} earnings awarded` : ''}`
    );

    fetchUserPosts();
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status: newStatus })
      .eq('id', submissionId);

    if (error) {
      console.error('Error updating submission status:', error);
      errorToast(
        "❌ Update Failed",
        "Failed to update submission status"
      );
      return;
    }

    successToast(
      "✅ Submission Updated!",
      "Submission status updated successfully"
    );

    fetchContactSubmissions();
  };

  // Filter functions
  const filteredSubmissions = contactSubmissions.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
      submission.email.toLowerCase().includes(messageSearch.toLowerCase()) ||
      submission.message.toLowerCase().includes(messageSearch.toLowerCase());
    
    const matchesFilter = messageFilter === 'all' || submission.status === messageFilter;
    
    return matchesSearch && matchesFilter;
  });

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

  if (!user || !isManager) {
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
                  <p className="text-sm text-muted-foreground">Content & Community Management</p>
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
        >
          <Tabs defaultValue="messages" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-card/50 backdrop-blur">
              <TabsTrigger value="messages" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Messages</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Posts</span>
              </TabsTrigger>
            </TabsList>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6"
              >
                <Card className="bg-card/50 backdrop-blur border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <span>Contact Messages</span>
                    </CardTitle>
                    <CardDescription>
                      Manage and respond to user inquiries
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search messages..."
                          value={messageSearch}
                          onChange={(e) => setMessageSearch(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <Select value={messageFilter} onValueChange={setMessageFilter}>
                        <SelectTrigger className="w-[180px] bg-background/50">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Messages</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-lg border bg-background/50 backdrop-blur overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSubmissions.map((submission) => (
                            <TableRow key={submission.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">{submission.name}</TableCell>
                              <TableCell>{submission.email}</TableCell>
                              <TableCell className="max-w-xs truncate">{submission.message}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    submission.status === 'pending' ? 'secondary' :
                                    submission.status === 'in_progress' ? 'default' :
                                    submission.status === 'resolved' ? 'default' : 'outline'
                                  }
                                  className={
                                    submission.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                                    submission.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' :
                                    submission.status === 'resolved' ? 'bg-green-500/10 text-green-600' :
                                    'bg-gray-500/10 text-gray-600'
                                  }
                                >
                                  {submission.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(submission.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Select
                                  defaultValue={submission.status}
                                  onValueChange={(value) => updateSubmissionStatus(submission.id, value)}
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6"
              >
                <Card className="bg-card/50 backdrop-blur border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <span>Gallery Management</span>
                    </CardTitle>
                    <CardDescription>
                      Upload and manage gallery images
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload Section */}
                    <div className="bg-background/50 rounded-lg p-4 border-2 border-dashed border-primary/20">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Image Title *</label>
                            <Input
                              placeholder="Enter image title"
                              value={newImageTitle}
                              onChange={(e) => setNewImageTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Caption (Optional)</label>
                            <Input
                              placeholder="Enter image caption"
                              value={newImageCaption}
                              onChange={(e) => setNewImageCaption(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Select Image *</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                          />
                        </div>
                        <Button 
                          onClick={addGalleryImage} 
                          disabled={uploadingImage || !selectedFile || !newImageTitle.trim()}
                          className="w-full"
                        >
                          {uploadingImage ? (
                            <>
                              <Upload className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Image to Gallery
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {galleryImages.map((image) => (
                        <Card key={image.id} className="overflow-hidden bg-background/50 backdrop-blur">
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={image.image_url}
                              alt={image.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge 
                                variant={image.is_active ? "default" : "secondary"}
                                className={image.is_active ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"}
                              >
                                {image.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground truncate">{image.title}</h3>
                            {image.caption && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{image.caption}</p>
                            )}
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-xs text-muted-foreground">
                                {new Date(image.created_at).toLocaleDateString()}
                              </span>
                              <Switch
                                checked={image.is_active}
                                onCheckedChange={() => toggleImageStatus(image.id, image.is_active)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6"
              >
                <Card className="bg-card/50 backdrop-blur border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span>Post Management</span>
                    </CardTitle>
                    <CardDescription>
                      Review and moderate user posts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search posts..."
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
                             <TableHead>User</TableHead>
                             <TableHead>Phone Number</TableHead>
                             <TableHead>Platform</TableHead>
                             <TableHead>Post URL</TableHead>
                             <TableHead>Reward</TableHead>
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
                                  className="text-primary hover:underline text-sm"
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
                                  <span>{post.earnings || 0}</span>
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
                                      onClick={() => updatePostStatus(post.id, 'approved', 10)}
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
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;