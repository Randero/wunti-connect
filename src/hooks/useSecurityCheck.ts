import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionSecurity, SecurityLogger } from '@/utils/security';

interface SecurityStatus {
  isSecure: boolean;
  sessionValid: boolean;
  lastCheck: Date | null;
  warnings: string[];
}

export const useSecurityCheck = () => {
  const { user, session } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isSecure: false,
    sessionValid: false,
    lastCheck: null,
    warnings: []
  });

  const performSecurityCheck = async () => {
    const warnings: string[] = [];
    let isSecure = true;

    try {
      // Check session validity
      const sessionValid = await SessionSecurity.validateSession();
      
      if (!sessionValid && user) {
        warnings.push('Session appears to be invalid or expired');
        isSecure = false;
        
        // Log security event
        await SecurityLogger.logSecurityEvent({
          type: 'suspicious_activity',
          userId: user?.id,
          details: 'Invalid session detected for authenticated user'
        });
      }

      // Check for HTTPS in production
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        warnings.push('Connection is not secure (HTTPS required)');
        isSecure = false;
      }

      // Check for session hijacking indicators
      if (session && user) {
        const userAgent = navigator.userAgent;
        const storedUserAgent = localStorage.getItem('auth_user_agent');
        
        if (storedUserAgent && storedUserAgent !== userAgent) {
          warnings.push('Potential session hijacking detected');
          isSecure = false;
          
          await SecurityLogger.logSecurityEvent({
            type: 'suspicious_activity',
            userId: user.id,
            details: 'User agent mismatch detected',
            metadata: { 
              stored: storedUserAgent,
              current: userAgent
            }
          });
        } else if (!storedUserAgent) {
          localStorage.setItem('auth_user_agent', userAgent);
        }
      }

      // Check for suspicious timing patterns
      const lastActivity = localStorage.getItem('last_activity');
      const now = Date.now();
      
      if (lastActivity) {
        const timeDiff = now - parseInt(lastActivity);
        // If more than 24 hours of inactivity, warn
        if (timeDiff > 24 * 60 * 60 * 1000 && user) {
          warnings.push('Long period of inactivity detected');
        }
      }
      
      localStorage.setItem('last_activity', now.toString());

      setSecurityStatus({
        isSecure,
        sessionValid,
        lastCheck: new Date(),
        warnings
      });

    } catch (error) {
      console.error('Security check failed:', error);
      setSecurityStatus({
        isSecure: false,
        sessionValid: false,
        lastCheck: new Date(),
        warnings: ['Security check failed']
      });
    }
  };

  // Perform security check on mount and periodically
  useEffect(() => {
    performSecurityCheck();
    
    // Check every 5 minutes
    const interval = setInterval(performSecurityCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, session]);

  // Check on focus (when user returns to tab)
  useEffect(() => {
    const handleFocus = () => performSecurityCheck();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return {
    securityStatus,
    performSecurityCheck
  };
};