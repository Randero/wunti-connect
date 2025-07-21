import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { successToast, errorToast } from '@/components/ui/enhanced-toast';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  const { signIn, signUp, user, userProfile, isAdmin, isModerator } = useAuth();
  
  const navigate = useNavigate();

  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if both user and profile are loaded and we haven't redirected yet
    if (user && userProfile && !hasRedirected) {
      setHasRedirected(true);
      
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (isModerator) {
        navigate('/moderator', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, userProfile, isAdmin, isModerator, navigate, hasRedirected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          errorToast(
            "❌ Login Failed",
            error.message
          );
        } else {
          successToast(
            "🎉 Welcome Back!",
            "Successfully logged in to your account."
          );
          // Don't redirect immediately, let the auth state change handle it
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.phoneNumber);
        if (error) {
          errorToast(
            "❌ Sign Up Failed",
            error.message
          );
        } else {
          successToast(
            "🎉 Account Created!",
            "Account created! Please check your email to verify your account."
          );
        }
      }
    } catch (error: any) {
      errorToast(
        "❌ Authentication Failed",
        "Something went wrong. Please try again."
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Welcome
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Join the movement for change
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                <TabsContent value="signup" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10 h-12"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="pl-10 h-12"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg"
                  >
                    {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </motion.div>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      </motion.div>
    </div>
  );
};

export default Auth;