import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { successToast, errorToast } from '@/components/ui/enhanced-toast';
import { Key, Eye, EyeOff, RefreshCw, Copy } from 'lucide-react';

interface UserPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
}

export const UserPasswordModal: React.FC<UserPasswordModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !user) return;
    
    setLoading(true);
    try {
      // Use Supabase Admin API to update user password
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.user_id,
        { password: newPassword }
      );

      if (error) throw error;

      successToast(
        "🎉 Password Updated Successfully!",
        `New password set for ${user.full_name}. They can now login with the new credentials.`
      );

      // Reset form
      setNewPassword('');
      setShowPassword(false);
      onClose();
    } catch (error: any) {
      console.error('Password reset error:', error);
      errorToast(
        "❌ Password Reset Failed",
        error.message || "Unable to reset password. Please check your admin permissions and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (newPassword) {
      try {
        await navigator.clipboard.writeText(newPassword);
        successToast("Password Copied!", "Password has been copied to clipboard.");
      } catch (error) {
        errorToast("Copy Failed", "Could not copy password to clipboard.");
      }
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Key className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>Reset User Password</span>
          </DialogTitle>
          <DialogDescription>
            Generate and set a new password for <strong>{user.full_name}</strong>
          </DialogDescription>
        </DialogHeader>

        <motion.div 
          className="space-y-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Generated password will appear here"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 w-8 p-0"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {newPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {newPassword && (
              <p className="text-xs text-muted-foreground">
                Password strength: {newPassword.length >= 8 ? 'Strong' : 'Weak'}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={generatePassword}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Secure Password
          </Button>

          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Make sure to share this password securely with the user. 
              They should change it on their first login.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordReset}
              disabled={loading || !newPassword}
              className="flex-1"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};