import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Activity,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  Settings
} from 'lucide-react';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdate: (userId: string, newRole: string) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onRoleUpdate
}) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'user');

  // Update selectedRole when user changes
  React.useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user?.role]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderator': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'manager': return <Settings className="w-4 h-4" />;
      case 'moderator': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.full_name || 'Unnamed User'}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete user profile and activity overview
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="font-medium">{user.full_name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="font-mono text-sm">{user.user_id}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Current Role</span>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>Account Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Account Created</span>
                    <span className="font-medium">{formatDate(user.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formatDate(user.updated_at)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Profile Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(user.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Role Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['user', 'moderator', 'manager', 'admin'].map((role) => (
                    <div
                      key={role}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedRole === role
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getRoleIcon(role)}
                          <div>
                            <p className="font-medium capitalize">{role}</p>
                            <p className="text-sm text-muted-foreground">
                              {role === 'admin' && 'Full system access'}
                              {role === 'manager' && 'Manage users and content'}
                              {role === 'moderator' && 'Moderate content'}
                              {role === 'user' && 'Basic user access'}
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedRole === role
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedRole === role && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedRole !== user.role && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4 border-t"
                  >
                    <Button
                      onClick={() => {
                        onRoleUpdate(user.user_id, selectedRole);
                        setSelectedRole(selectedRole);
                      }}
                      className="w-full"
                    >
                      Update Role to {selectedRole}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>Account Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Account Actions</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Manage this user's account settings and access
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Reset Password
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        Suspend Account
                      </Button>
                      <Button variant="destructive" size="sm" className="w-full">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};