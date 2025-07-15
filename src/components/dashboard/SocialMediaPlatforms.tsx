import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Smartphone, 
  Wifi, 
  ArrowRight,
  X,
  Star,
  Zap,
  Gift
} from 'lucide-react';

interface SocialMediaPlatformsProps {
  onSelect: (platform: string, rewardType: 'airtime' | 'data') => void;
  onClose: () => void;
  selectedImages: any[];
}

const SocialMediaPlatforms: React.FC<SocialMediaPlatformsProps> = ({
  onSelect,
  onClose,
  selectedImages
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedReward, setSelectedReward] = useState<'airtime' | 'data'>('airtime');
  const [step, setStep] = useState<'platform' | 'reward'>('platform');

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-600 to-blue-700',
      description: 'Share with your Facebook community',
      reward: '$2.50',
      users: '2.8B+'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-500 via-purple-500 to-orange-500',
      description: 'Post to your Instagram feed',
      reward: '$3.00',
      users: '2B+'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'from-gray-800 to-black',
      description: 'Tweet to your followers',
      reward: '$2.00',
      users: '450M+'
    }
  ];

  const rewardTypes = [
    {
      id: 'airtime',
      name: 'Mobile Airtime',
      icon: Smartphone,
      description: 'Get mobile airtime credits',
      benefit: 'Instant top-up'
    },
    {
      id: 'data',
      name: 'Mobile Data',
      icon: Wifi,
      description: 'Get mobile data bundles',
      benefit: 'High-speed internet'
    }
  ];

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setStep('reward');
  };

  const handleRewardSelect = (rewardType: 'airtime' | 'data') => {
    setSelectedReward(rewardType);
  };

  const handleProceed = () => {
    if (selectedPlatform && selectedReward) {
      onSelect(selectedPlatform, selectedReward);
    }
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center">
              {step === 'platform' ? (
                <>
                  <Star className="h-6 w-6 mr-2 text-primary" />
                  Choose Social Media Platform
                </>
              ) : (
                <>
                  <Gift className="h-6 w-6 mr-2 text-primary" />
                  Select Your Reward
                </>
              )}
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
          {/* Selected Images Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20"
          >
            <h3 className="font-semibold mb-3">Selected Images ({selectedImages.length})</h3>
            <div className="flex space-x-2 overflow-x-auto">
              {selectedImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex-shrink-0"
                >
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-primary/30"
                  />
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'platform' && (
              <motion.div
                key="platform"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-muted-foreground text-center">
                  Select where you'd like to share your campaign post
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {platforms.map((platform, index) => {
                    const Icon = platform.icon;
                    return (
                      <motion.div
                        key={platform.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/50"
                          onClick={() => handlePlatformSelect(platform.id)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${platform.color} flex items-center justify-center mx-auto mb-4`}>
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{platform.name}</h3>
                            <p className="text-muted-foreground text-sm mb-3">
                              {platform.description}
                            </p>
                            <div className="space-y-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Earn {platform.reward}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {platform.users} users
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 'reward' && (
              <motion.div
                key="reward"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Platform Summary */}
                {selectedPlatformData && (
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedPlatformData.color} flex items-center justify-center mr-4`}>
                        <selectedPlatformData.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedPlatformData.name} Selected</h3>
                        <p className="text-sm text-muted-foreground">
                          Potential earnings: {selectedPlatformData.reward}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-muted-foreground">
                    How would you like to receive your reward?
                  </p>
                </div>

                <RadioGroup
                  value={selectedReward}
                  onValueChange={(value: 'airtime' | 'data') => handleRewardSelect(value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {rewardTypes.map((reward, index) => {
                    const Icon = reward.icon;
                    return (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Label
                          htmlFor={reward.id}
                          className="cursor-pointer"
                        >
                          <Card className={`transition-all duration-300 hover:shadow-lg ${
                            selectedReward === reward.id 
                              ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}>
                            <CardContent className="p-6 text-center">
                              <div className="flex items-center justify-between mb-4">
                                <Icon className={`h-8 w-8 ${
                                  selectedReward === reward.id ? 'text-primary' : 'text-muted-foreground'
                                }`} />
                                <RadioGroupItem
                                  value={reward.id}
                                  id={reward.id}
                                  className="data-[state=checked]:text-primary"
                                />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{reward.name}</h3>
                              <p className="text-muted-foreground text-sm mb-3">
                                {reward.description}
                              </p>
                              <Badge variant="outline" className={
                                selectedReward === reward.id ? 'border-primary text-primary' : ''
                              }>
                                <Zap className="h-3 w-3 mr-1" />
                                {reward.benefit}
                              </Badge>
                            </CardContent>
                          </Card>
                        </Label>
                      </motion.div>
                    );
                  })}
                </RadioGroup>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('platform')}
                  >
                    Back to Platforms
                  </Button>
                  
                  <Button
                    onClick={handleProceed}
                    disabled={!selectedPlatform || !selectedReward}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    Proceed to Posting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialMediaPlatforms;