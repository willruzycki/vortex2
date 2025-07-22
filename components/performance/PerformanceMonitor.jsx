import React, { useEffect, useState } from "react";
import { PerformanceMetrics } from "@/api/entities";

export default function PerformanceMonitor() {
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [metricsQueue, setMetricsQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Track online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Only track performance metrics if online to avoid errors
    if (isOnline) {
      setupPerformanceTracking();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sessionId, isOnline]);

  // Flush metrics queue when back online
  useEffect(() => {
    if (isOnline && metricsQueue.length > 0) {
      flushMetricsQueue();
    }
  }, [isOnline, metricsQueue]);

  const setupPerformanceTracking = () => {
    // Throttled performance tracking to reduce load
    let lastMetricTime = 0;
    const METRIC_THROTTLE = 5000; // Only record metrics every 5 seconds

    const throttledRecordMetric = (metricName, value, unit, additionalData = {}) => {
      const now = Date.now();
      if (now - lastMetricTime < METRIC_THROTTLE) return;
      lastMetricTime = now;
      
      recordMetric(metricName, value, unit, additionalData);
    };

    // Track page load time - only once
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        throttledRecordMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart, 'milliseconds');
      }
    }, 1000);

    // Track Core Web Vitals with throttling
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          throttledRecordMetric('lcp', lastEntry.startTime, 'milliseconds');
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            throttledRecordMetric('fid', entry.processingStart - entry.startTime, 'milliseconds');
          }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS) - throttled
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          throttledRecordMetric('cls', clsValue, 'percentage');
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // Monitor critical errors only
    window.addEventListener('error', (event) => {
      // Only track critical errors to avoid spam
      if (event.message.includes('Network') || event.message.includes('Failed to fetch')) {
        recordMetric('critical_error', 1, 'count', {
          error_message: event.message.substring(0, 100), // Limit message length
          filename: event.filename,
          line: event.lineno
        });
      }
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      recordMetric('unhandled_rejection', 1, 'count', {
        reason: event.reason?.toString().substring(0, 100)
      });
    });
  };

  const recordMetric = async (metricName, value, unit, additionalData = {}) => {
    const metric = {
      metric_name: metricName,
      value: Math.round(value * 100) / 100,
      unit: unit,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      device_type: getDeviceType(),
      browser: getBrowserInfo(),
      ...additionalData
    };

    if (isOnline) {
      try {
        await PerformanceMetrics.create(metric);
      } catch (error) {
        // Add to queue for later if network error
        if (error.message && error.message.includes('Network')) {
          setMetricsQueue(prev => [...prev, metric]);
        }
      }
    } else {
      // Add to queue when offline
      setMetricsQueue(prev => [...prev, metric]);
    }
  };

  const flushMetricsQueue = async () => {
    if (metricsQueue.length === 0) return;

    try {
      // Send metrics in batch to reduce requests
      for (const metric of metricsQueue) {
        await PerformanceMetrics.create(metric);
      }
      setMetricsQueue([]);
    } catch (error) {
      console.warn('Failed to flush metrics queue:', error);
    }
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  };

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  return null;
}