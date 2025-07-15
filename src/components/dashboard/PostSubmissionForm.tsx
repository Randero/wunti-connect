import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  ExternalLink,
  Link2,
  CheckCircle,
  Smartphone,
  Wifi,
  X,
  AlertCircle,
  Copy,
  Share2
} from 'lucide-react';

interface PostSubmissionFormProps {
  platform: string;
  rewardType: 'airtime' | 'data';
  onSubmit: (postUrl: string) => void;
  onClose: () => void;
}

const PostSubmissionForm: React.FC<PostSubmissionFormProps> = ({
  platform,
  rewardType,
  onSubmit,
  onClose
}) => {
  const [postUrl, setPostUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'instructions' | 'submit'>('instructions');
  const { toast } = useToast();

  const platformConfig = {
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      url: 'https://www.facebook.com/sharer/sharer.php',
      instructions: [
        'Click the "Open Facebook" button below',
        'Write a compelling post about the candidate',
        'Upload the selected campaign images',
        'Add relevant hashtags and tag friends',
        'Publish your post',
        'Copy the post URL and paste it below'
      ]
    },
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      url: 'https://www.instagram.com',
      instructions: [
        'Click the "Open Instagram" button below',
        'Create a new post with the campaign images',
        'Write an engaging caption',
        'Use relevant hashtags (#vote2024, etc.)',
        'Share your post',
        'Copy the post URL and submit it below'
      ]
    },
    twitter: {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'text-gray-800',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      url: 'https://twitter.com/compose/tweet',
      instructions: [
        'Click the "Open Twitter" button below',
        'Compose a tweet about the candidate',
        'Attach the campaign images',
        'Add relevant hashtags and mentions',
        'Post your tweet',
        'Copy the tweet URL and paste it here'
      ]
    }
  };

  const config = platformConfig[platform as keyof typeof platformConfig];
  const Icon = config?.icon || Share2;
  const rewardIcon = rewardType === 'airtime' ? Smartphone : Wifi;
  const RewardIcon = rewardIcon;

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) return false;

    // Platform-specific validation
    switch (platform) {
      case 'facebook':
        return url.includes('facebook.com') || url.includes('fb.com');
      case 'instagram':
        return url.includes('instagram.com') || url.includes('instagr.am');
      case 'twitter':
        return url.includes('twitter.com') || url.includes('t.co') || url.includes('x.com');
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(postUrl)) {
      toast({
        title: "Invalid URL",
        description: `Please enter a valid ${config?.name} post URL`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(postUrl);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSocialMedia = () => {
    window.open(config?.url, '_blank');
    setStep('submit');
  };

  const copyInstructions = () => {
    const instructions = config?.instructions.join('\n') || '';
    navigator.clipboard.writeText(instructions);
    toast({
      title: "Instructions Copied",
      description: "Instructions have been copied to your clipboard"
    });
  };

  if (!config) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Icon className={`h-6 w-6 mr-2 ${config.color}`} />
              Post to {config.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reward Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className={`h-8 w-8 mr-3 ${config.color}`} />
                <div>
                  <h3 className="font-semibold">Platform: {config.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Share campaign content and earn rewards
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center">
                  <RewardIcon className="h-4 w-4 mr-1 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {rewardType === 'airtime' ? 'Airtime' : 'Data'} Reward
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {step === 'instructions' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                    Posting Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Follow these steps to complete your social media post:
                  </p>
                  
                  <div className="space-y-3">
                    {config.instructions.map((instruction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <Badge variant="outline" className="mr-3 mt-0.5 min-w-[24px] h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <p className="text-sm">{instruction}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={openSocialMedia}
                      className={`flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open {config.name}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={copyInstructions}
                      className="px-4"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-yellow-800">Important Guidelines</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Make sure your post is public and visible</li>
                        <li>• Include at least one campaign image</li>
                        <li>• Write authentic, engaging content</li>
                        <li>• Use relevant hashtags for better reach</li>
                        <li>• Don't delete the post for at least 48 hours</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'submit' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Link2 className="h-5 w-5 mr-2 text-primary" />
                    Submit Your Post URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="postUrl" className="text-sm font-medium">
                        {config.name} Post URL *
                      </Label>
                      <Input
                        id="postUrl"
                        type="url"
                        value={postUrl}
                        onChange={(e) => setPostUrl(e.target.value)}
                        placeholder={`https://${platform}.com/...`}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Copy and paste the direct link to your post
                      </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('instructions')}
                        className="flex-1"
                      >
                        Back to Instructions
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={!postUrl.trim() || isSubmitting}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Submit Post
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">What happens next?</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Your submission will be reviewed within 24 hours</li>
                        <li>• You'll receive a notification when approved</li>
                        <li>• Rewards will be credited to your account</li>
                        <li>• You can track progress in your dashboard</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostSubmissionForm;