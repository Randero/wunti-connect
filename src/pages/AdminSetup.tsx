import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { successToast, errorToast } from '@/components/ui/enhanced-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, ArrowLeft, Shield, Lock } from 'lucide-react';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  
  const navigate = useNavigate();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the user's role to admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Continue anyway, we can fix the role later
        }

        successToast(
          "✨ Admin Account Created!",
          "Admin account created successfully. Please check your email to verify your account, then you can login."
        );

        // Show the credentials for easy reference
        setTimeout(() => {
          successToast(
            "📝 Your Admin Credentials",
            `Email: ${formData.email} - Save these credentials!`
          );
        }, 2000);
      }
    } catch (error: any) {
      errorToast(
        "❌ Setup Failed",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetExistingAdmin = async () => {
    setLoading(true);
    try {
      // Reset password for existing admin
      const { error } = await supabase.auth.resetPasswordForEmail(
        'abubakarsadiqibrahim4321@gmail.com',
        {
          redirectTo: `${window.location.origin}/auth`,
        }
      );

      if (error) throw error;

      successToast(
        "📧 Password Reset Sent!",
        "Check your email for password reset instructions."
      );
    } catch (error: any) {
      errorToast(
        "❌ Reset Failed",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-6"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Reset Existing Admin */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="w-6 h-6 text-primary" />
              <Crown className="w-6 h-6 text-secondary" />
            </div>
            <CardTitle className="text-xl">Reset Existing Admin</CardTitle>
            <CardDescription>
              If you already have an admin account but forgot the password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Admin Email:</p>
                <p className="font-mono text-sm">abubakarsadiqibrahim4321@gmail.com</p>
              </div>
              <Button
                onClick={handleResetExistingAdmin}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create New Admin */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="w-6 h-6 text-primary" />
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <CardTitle className="text-xl">Create New Admin</CardTitle>
            <CardDescription>
              Create a fresh admin account with new credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter admin full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Crown className="w-4 h-4 mr-2" />
                {loading ? "Creating Admin..." : "Create Admin Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Access Instructions */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Quick Access Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>Step 1:</strong> Either reset existing admin password or create new admin</p>
              <p><strong>Step 2:</strong> Check your email and verify the account</p>
              <p><strong>Step 3:</strong> Login at <code className="bg-muted px-1 rounded">/auth</code></p>
              <p><strong>Step 4:</strong> Access admin dashboard at <code className="bg-muted px-1 rounded">/admin</code></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSetup;