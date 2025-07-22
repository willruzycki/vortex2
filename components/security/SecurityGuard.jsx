import React, { useEffect, useState } from "react";
import { SecurityAuditLog, RateLimitTracker, User } from "@/api/entities";

export default function SecurityGuard({ children }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    checkSecurityStatus();
    monitorUserBehavior();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      const clientIP = await getClientIP();
      
      // Check if IP is rate limited
      const rateLimits = await RateLimitTracker.filter({
        identifier: clientIP,
        identifier_type: 'ip'
      });

      const blockedLimit = rateLimits.find(limit => 
        limit.blocked_until && new Date(limit.blocked_until) > new Date()
      );

      if (blockedLimit) {
        setIsBlocked(true);
        setBlockReason(`Too many requests. Try again after ${new Date(blockedLimit.blocked_until).toLocaleTimeString()}`);
        return;
      }

    } catch (error) {
      console.error('Security check failed:', error);
    }
  };

  const monitorUserBehavior = () => {
    let clickCount = 0;
    let rapidClickTimer;

    // Monitor for rapid clicking (potential bot behavior)
    document.addEventListener('click', () => {
      clickCount++;
      
      clearTimeout(rapidClickTimer);
      rapidClickTimer = setTimeout(() => {
        clickCount = 0;
      }, 1000);

      if (clickCount > 20) { // More than 20 clicks per second
        logSecurityEvent('suspicious_clicking', false, 'Rapid clicking detected');
      }
    });

    // Monitor for suspicious keyboard patterns
    let keyPressCount = 0;
    document.addEventListener('keypress', () => {
      keyPressCount++;
      
      setTimeout(() => {
        keyPressCount = Math.max(0, keyPressCount - 1);
      }, 100);

      if (keyPressCount > 50) { // More than 50 keypresses in 5 seconds
        logSecurityEvent('suspicious_typing', false, 'Rapid typing detected');
      }
    });

    // Monitor tab visibility changes (tab switching detection)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        logSecurityEvent('tab_hidden', true, 'User switched away from tab');
      } else {
        logSecurityEvent('tab_visible', true, 'User returned to tab');
      }
    });
  };

  const logSecurityEvent = async (actionType, success, reason = '') => {
    try {
      const user = await User.me().catch(() => null);
      const clientIP = await getClientIP();

      await SecurityAuditLog.create({
        user_id: user?.id,
        action_type: actionType,
        ip_address: clientIP,
        user_agent: navigator.userAgent,
        success: success,
        failure_reason: reason,
        geolocation: await getGeolocation(),
        risk_score: calculateRiskScore(actionType, success),
        additional_metadata: {
          timestamp: new Date().toISOString(),
          page_url: window.location.href,
          referrer: document.referrer
        }
      });
    } catch (error) {
      // Security logging is a background task. If it fails due to a network error,
      // warn but don't pollute the console with critical errors.
      if (error.message && error.message.includes("Network Error")) {
        console.warn('Failed to log security event due to a network issue.');
      } else {
        console.error('Failed to log security event:', error);
      }
    }
  };

  const calculateRiskScore = (actionType, success) => {
    let baseScore = 0;
    
    // Risk scoring based on action type
    switch (actionType) {
      case 'failed_login': baseScore = 30; break;
      case 'suspicious_clicking': baseScore = 60; break;
      case 'suspicious_typing': baseScore = 40; break;
      case 'rapid_requests': baseScore = 70; break;
      default: baseScore = 10; break;
    }

    // Increase risk for failures
    if (!success) baseScore += 20;

    return Math.min(100, baseScore);
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  const getGeolocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        region: data.region,
        city: data.city
      };
    } catch (error) {
      return { country: 'Unknown', region: 'Unknown', city: 'Unknown' };
    }
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Temporarily Restricted</h1>
          <p className="text-red-600 mb-4">{blockReason}</p>
          <p className="text-sm text-red-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}