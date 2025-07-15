import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface UserPost {
  id: string;
  selected_images: string[];
  social_platform: string;
  reward_type: string;
  post_url: string;
  status: string;
  earnings: number;
  created_at: string;
  updated_at: string;
}

const PostHistory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load post history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Pending Review'
        };
      case 'processing':
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Processing'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Approved'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Rejected'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown'
        };
    }
  };

  const getPlatformConfig = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return { icon: Facebook, name: 'Facebook', color: 'text-blue-600' };
      case 'instagram':
        return { icon: Instagram, name: 'Instagram', color: 'text-pink-600' };
      case 'twitter':
        return { icon: Twitter, name: 'Twitter/X', color: 'text-gray-800' };
      default:
        return { icon: ExternalLink, name: platform, color: 'text-gray-600' };
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.post_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.social_platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    processing: posts.filter(p => p.status === 'processing').length,
    approved: posts.filter(p => p.status === 'approved').length,
    rejected: posts.filter(p => p.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Loading your post history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-primary" />
          Post History
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status} ({count})
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by creating your first campaign post!'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredPosts.map((post, index) => {
                const statusConfig = getStatusConfig(post.status);
                const platformConfig = getPlatformConfig(post.social_platform);
                const StatusIcon = statusConfig.icon;
                const PlatformIcon = platformConfig.icon;

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="group"
                  >
                    <Card className={`border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} hover:shadow-lg transition-all duration-300`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* Post Info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <PlatformIcon className={`h-5 w-5 ${platformConfig.color}`} />
                                <span className="font-medium">{platformConfig.name}</span>
                              </div>
                              
                              <Badge variant="outline" className="capitalize">
                                {post.reward_type}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(post.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>

                            <div className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={post.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline truncate max-w-xs"
                              >
                                {post.post_url}
                              </a>
                            </div>

                            {/* Selected Images Preview */}
                            {post.selected_images && post.selected_images.length > 0 && (
                              <div className="flex gap-2">
                                {post.selected_images.slice(0, 3).map((imageUrl, imgIndex) => (
                                  <motion.img
                                    key={imgIndex}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: imgIndex * 0.1 }}
                                    src={imageUrl}
                                    alt={`Campaign image ${imgIndex + 1}`}
                                    className="w-12 h-12 object-cover rounded-lg border border-border"
                                  />
                                ))}
                                {post.selected_images.length > 3 && (
                                  <div className="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center text-xs font-medium">
                                    +{post.selected_images.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Status and Earnings */}
                          <div className="flex sm:flex-col items-center sm:items-end gap-3">
                            <Badge 
                              variant="outline" 
                              className={`${statusConfig.color} ${statusConfig.borderColor}`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>

                            {post.earnings > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="flex items-center text-green-600 font-semibold"
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                {post.earnings.toFixed(2)}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostHistory;