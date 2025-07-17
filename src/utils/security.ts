// Security utilities for application-wide security measures
import { supabase } from '@/integrations/supabase/client';

// Content Security Policy headers for enhanced security
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Input sanitization utilities
export class InputSanitizer {
  // Sanitize text input to prevent XSS
  static sanitizeText(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 1000); // Limit length
  }

  // Sanitize email input
  static sanitizeEmail(email: string): string {
    if (!email) return '';
    
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const sanitized = email.toLowerCase().trim();
    
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  // Sanitize phone number
  static sanitizePhone(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters except + and spaces
    return phone.replace(/[^\d\+\s\-\(\)]/g, '').slice(0, 20);
  }

  // Sanitize URL input
  static sanitizeUrl(url: string): string {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '';
      }
      return urlObj.toString();
    } catch {
      return '';
    }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();
  
  static checkLimit(key: string, maxAttempts: number = 5, windowMs: number = 900000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userAttempts.count >= maxAttempts) {
      return false;
    }
    
    userAttempts.count++;
    return true;
  }
  
  static resetLimit(key: string): void {
    this.attempts.delete(key);
  }
}

// Password strength validation
export class PasswordValidator {
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common patterns
    const commonPatterns = [
      /123456/, /password/i, /qwerty/i, /admin/i, /letmein/i,
      /welcome/i, /monkey/i, /dragon/i, /master/i, /superman/i
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains common patterns that are easily guessed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static generateSecure(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one character from each required category
    const categories = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      '!@#$%^&*()_+-=[]{}|;:,.<>?'
    ];
    
    categories.forEach(category => {
      password += category.charAt(Math.floor(Math.random() * category.length));
    });
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Session security utilities
export class SessionSecurity {
  // Check if session is expired or invalid
  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }
      
      // Check if token is expired
      const now = Date.now() / 1000;
      if (session.expires_at && session.expires_at < now) {
        await supabase.auth.signOut();
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
  
  // Refresh session token
  static async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return !error && !!data.session;
    } catch {
      return false;
    }
  }
}

// CSRF protection utilities
export class CSRFProtection {
  private static token: string | null = null;
  
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return this.token;
  }
  
  static validateToken(token: string): boolean {
    return this.token === token;
  }
  
  static getToken(): string | null {
    return this.token;
  }
}

// Data encryption utilities for sensitive data
export class DataEncryption {
  // Simple base64 encoding for non-sensitive data display
  static encode(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data;
    }
  }
  
  static decode(encodedData: string): string {
    try {
      return decodeURIComponent(atob(encodedData));
    } catch {
      return encodedData;
    }
  }
}

// Security event logging
export class SecurityLogger {
  static async logSecurityEvent(event: {
    type: 'login_attempt' | 'failed_login' | 'permission_denied' | 'suspicious_activity';
    userId?: string;
    details: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const logEntry = {
        ...event,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: await this.getClientIP(),
      };
      
      // In production, this should be sent to a security monitoring service
      console.warn('Security Event:', logEntry);
      
      // Optionally store in database for admin review
      if (event.type === 'failed_login' || event.type === 'suspicious_activity') {
        // Could implement database logging here
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  private static async getClientIP(): Promise<string> {
    try {
      // This is a simple implementation - in production use a proper IP detection service
      return 'client_ip_masked';
    } catch {
      return 'unknown';
    }
  }
}

// File upload security
export class FileUploadSecurity {
  private static allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf'
  ];
  
  private static maxFileSize = 10 * 1024 * 1024; // 10MB
  
  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }
    
    if (file.size > this.maxFileSize) {
      errors.push('File size too large (max 10MB)');
    }
    
    // Check file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeToExt: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'application/pdf': ['pdf']
    };
    
    const validExtensions = mimeToExt[file.type];
    if (validExtensions && extension && !validExtensions.includes(extension)) {
      errors.push('File extension does not match file type');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
      .slice(0, 100); // Limit length
  }
}
