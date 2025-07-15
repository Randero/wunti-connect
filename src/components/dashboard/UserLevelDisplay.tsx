import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Target,
  Award,
  Gem,
  Shield,
  Flame,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';

interface UserLevel {
  current_level: number;
  experience_points: number;
  total_posts: number;
  total_earnings: number;
  next_level_threshold: number;
}

interface UserLevelDisplayProps {
  userLevel: UserLevel;
}

const UserLevelDisplay: React.FC<UserLevelDisplayProps> = ({ userLevel }) => {
  const [showAllLevels, setShowAllLevels] = useState(false);
  const levelConfig = {
    1: { name: 'Newcomer', icon: Star, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50' },
    2: { name: 'Supporter', icon: Zap, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    3: { name: 'Advocate', icon: Target, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
    4: { name: 'Champion', icon: Award, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50' },
    5: { name: 'Influencer', icon: Flame, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
    6: { name: 'Elite', icon: Gem, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    7: { name: 'Master', icon: Shield, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50' },
    8: { name: 'Legendary', icon: Crown, color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50' },
    9: { name: 'Supreme', icon: Trophy, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
    10: { name: 'Grandmaster', icon: Sparkles, color: 'from-gradient-start to-gradient-end', bgColor: 'bg-gradient-to-r from-primary/10 to-secondary/10' }
  };

  const currentLevelConfig = levelConfig[userLevel.current_level as keyof typeof levelConfig];
  const nextLevelConfig = levelConfig[(userLevel.current_level + 1) as keyof typeof levelConfig];
  
  const Icon = currentLevelConfig?.icon || Star;
  const NextIcon = nextLevelConfig?.icon || Trophy;

  // Calculate progress to next level
  const currentLevelExp = userLevel.current_level === 1 ? 0 : 
    Array.from({ length: userLevel.current_level - 1 }, (_, i) => (i + 1) * 100 + i * (i + 1) * 50)
      .reduce((sum, exp) => sum + exp, 0);
  
  const nextLevelExp = userLevel.current_level === 10 ? 
    currentLevelExp + 1000 : 
    currentLevelExp + (userLevel.current_level * 100 + (userLevel.current_level - 1) * userLevel.current_level * 50);

  const progressPercentage = userLevel.current_level === 10 ? 100 : 
    Math.min(((userLevel.experience_points - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100, 100);

  const expNeeded = userLevel.current_level === 10 ? 0 : nextLevelExp - userLevel.experience_points;

  const levelRewards = {
    2: 'Unlock exclusive campaign images',
    3: 'Higher reward multipliers',
    4: 'Priority post review',
    5: 'Special bonus campaigns',
    6: 'VIP support access',
    7: 'Custom profile badges',
    8: 'Exclusive events access',
    9: 'Leadership board recognition',
    10: 'Maximum earning potential'
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              {/* Current Level Display */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className={`w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-r ${currentLevelConfig?.color || 'from-primary to-secondary'} flex items-center justify-center mx-auto mb-4 shadow-lg cursor-pointer`}
                  onClick={() => setShowAllLevels(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-8 w-8 md:h-12 md:w-12 text-white" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Level {userLevel.current_level}</h2>
                  <Badge variant="secondary" className="text-sm md:text-lg px-3 py-1 md:px-4 md:py-2 mb-2">
                    {currentLevelConfig?.name || 'User'}
                  </Badge>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {userLevel.experience_points} XP earned
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllLevels(true)}
                    className="mt-2 text-xs text-primary hover:text-primary/80"
                  >
                    View All Levels <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </motion.div>
              </div>

              {/* Progress Section */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs md:text-sm font-medium">Progress to Level {userLevel.current_level + 1}</span>
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="relative"
                  >
                    <Progress 
                      value={progressPercentage} 
                      className="h-2 md:h-3 bg-muted"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                      className="absolute -top-1 bg-primary rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white shadow-lg"
                      style={{ left: `${Math.min(progressPercentage, 95)}%` }}
                    />
                  </motion.div>
                  
                  {userLevel.current_level < 10 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {expNeeded} XP needed for next level
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center p-3 md:p-4 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <div className="text-xl md:text-2xl font-bold text-primary">{userLevel.total_posts}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Total Posts</div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-center p-3 md:p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <div className="text-xl md:text-2xl font-bold text-green-600">${userLevel.total_earnings}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Total Earned</div>
                  </motion.div>
                </div>
              </div>

            {/* Next Level Preview */}
            {userLevel.current_level < 10 && nextLevelConfig && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${nextLevelConfig.color} flex items-center justify-center mx-auto mb-4 opacity-60 hover:opacity-100 transition-opacity`}
                >
                  <NextIcon className="h-10 w-10 text-white" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <h3 className="text-xl font-semibold mb-2">Next: Level {userLevel.current_level + 1}</h3>
                  <Badge variant="outline" className="mb-3">
                    {nextLevelConfig.name}
                  </Badge>
                  
                  {levelRewards[userLevel.current_level + 1 as keyof typeof levelRewards] && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 border border-primary/20"
                    >
                      <p className="text-sm font-medium mb-1">Unlock Reward:</p>
                      <p className="text-xs text-muted-foreground">
                        {levelRewards[userLevel.current_level + 1 as keyof typeof levelRewards]}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            )}

            {/* Max Level Achievement */}
            {userLevel.current_level === 10 && (
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Crown className="h-10 w-10 text-white" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-yellow-600 mb-2">🎉 Maximum Level!</h3>
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-yellow-600 mb-3">
                    Grandmaster Achieved
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    You've reached the highest level possible. Congratulations on your dedication!
                  </p>
                </motion.div>
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Levels Modal */}
      <Dialog open={showAllLevels} onOpenChange={setShowAllLevels}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-primary" />
                Level System Overview
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllLevels(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              Progress through 10 levels by posting and earning. Each level unlocks new rewards and features.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(levelConfig).map(([level, config]) => {
                const levelNum = parseInt(level);
                const LevelIcon = config.icon;
                const isCurrentLevel = levelNum === userLevel.current_level;
                const isUnlocked = levelNum <= userLevel.current_level;
                
                return (
                  <motion.div
                    key={level}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: levelNum * 0.05 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCurrentLevel 
                        ? 'border-primary bg-primary/10 shadow-lg' 
                        : isUnlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center mx-auto mb-3 shadow-md ${
                        !isUnlocked ? 'grayscale' : ''
                      }`}>
                        <LevelIcon className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className="font-bold text-lg mb-1">Level {level}</h3>
                      <Badge variant={isCurrentLevel ? "default" : isUnlocked ? "secondary" : "outline"} className="mb-2">
                        {config.name}
                      </Badge>
                      
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">
                          XP Required: {levelNum === 1 ? '0' : `${levelNum * 100 + (levelNum - 1) * levelNum * 50}`}
                        </p>
                        
                        {levelRewards[levelNum as keyof typeof levelRewards] && (
                          <div className="bg-white/50 rounded p-2 mt-2">
                            <p className="text-xs font-medium text-primary">Reward:</p>
                            <p className="text-xs">{levelRewards[levelNum as keyof typeof levelRewards]}</p>
                          </div>
                        )}
                        
                        {isCurrentLevel && (
                          <Badge variant="default" className="mt-2">
                            Current Level
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserLevelDisplay;