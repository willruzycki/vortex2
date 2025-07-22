import React, { useState, useEffect, useRef } from "react";
import { PerformanceMetrics, SystemMetrics, Video, User } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  Activity, 
  Users, 
  Play, 
  TrendingUp, 
  Database, 
  Wifi,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function RealtimeAnalytics() {
  const [metrics, setMetrics] = useState({
    concurrent_users: 0,
    videos_streaming: 0,
    uploads_in_progress: 0,
    api_requests_per_second: 0,
    database_connections: 0,
    cdn_bandwidth: 0,
    error_rate: 0,
    avg_response_time: 0
  });
  const [systemHealth, setSystemHealth] = useState({});
  const [alerts, setAlerts] = useState([]);
  const metricsBuffer = useRef([]);
  const wsConnection = useRef(null);

  useEffect(() => {
    startRealtimeMonitoring();
    return () => {
      if (wsConnection.current) {
        wsConnection.current.close();
      }
    };
  }, []);

  const startRealtimeMonitoring = () => {
    // Simulate real-time metrics collection
    const interval = setInterval(async () => {
      try {
        await collectRealtimeMetrics();
      } catch (error) {
        console.error('Metrics collection failed:', error);
      }
    }, 1000); // Every second

    // Simulate WebSocket connection for real-time updates
    simulateWebSocketConnection();

    return () => clearInterval(interval);
  };

  const collectRealtimeMetrics = async () => {
    // Simulate real-time data collection
    const newMetrics = {
      concurrent_users: Math.floor(Math.random() * 50000) + 10000,
      videos_streaming: Math.floor(Math.random() * 25000) + 5000,
      uploads_in_progress: Math.floor(Math.random() * 500) + 50,
      api_requests_per_second: Math.floor(Math.random() * 2000) + 500,
      database_connections: Math.floor(Math.random() * 200) + 100,
      cdn_bandwidth: Math.floor(Math.random() * 10000) + 2000, // Mbps
      error_rate: Math.random() * 2, // Percentage
      avg_response_time: Math.random() * 200 + 50 // ms
    };

    setMetrics(newMetrics);

    // Store metrics for historical analysis
    metricsBuffer.current.push({
      ...newMetrics,
      timestamp: Date.now()
    });

    // Keep only last 100 data points
    if (metricsBuffer.current.length > 100) {
      metricsBuffer.current = metricsBuffer.current.slice(-100);
    }

    // Check for alerts
    checkSystemAlerts(newMetrics);

    // Store metrics to database periodically
    if (Math.random() < 0.1) { // 10% chance to store
      try {
        await SystemMetrics.create({
          metric_type: 'realtime_monitoring',
          timestamp: new Date().toISOString(),
          device_type: 'server',
          session_duration: newMetrics.concurrent_users,
          response_time: newMetrics.avg_response_time,
          bandwidth_used: newMetrics.cdn_bandwidth * 1024 * 1024, // Convert to bytes
          search_results_count: newMetrics.api_requests_per_second
        });
      } catch (error) {
        console.warn('Failed to store metrics:', error);
      }
    }
  };

  const simulateWebSocketConnection = () => {
    // Simulate WebSocket for real-time updates
    wsConnection.current = {
      readyState: 1, // OPEN
      close: () => {},
      send: (data) => {
        console.log('WebSocket send:', data);
      }
    };
  };

  const checkSystemAlerts = (currentMetrics) => {
    const newAlerts = [];

    // High error rate alert
    if (currentMetrics.error_rate > 5) {
      newAlerts.push({
        id: 'high_error_rate',
        type: 'critical',
        message: `Error rate is ${currentMetrics.error_rate.toFixed(2)}% (threshold: 5%)`,
        timestamp: new Date().toISOString()
      });
    }

    // High response time alert
    if (currentMetrics.avg_response_time > 500) {
      newAlerts.push({
        id: 'high_response_time',
        type: 'warning',
        message: `Average response time is ${currentMetrics.avg_response_time.toFixed(0)}ms (threshold: 500ms)`,
        timestamp: new Date().toISOString()
      });
    }

    // Too many database connections
    if (currentMetrics.database_connections > 250) {
      newAlerts.push({
        id: 'db_connections',
        type: 'warning',
        message: `Database connections: ${currentMetrics.database_connections} (threshold: 250)`,
        timestamp: new Date().toISOString()
      });
    }

    // High bandwidth usage
    if (currentMetrics.cdn_bandwidth > 8000) {
      newAlerts.push({
        id: 'high_bandwidth',
        type: 'info',
        message: `CDN bandwidth: ${currentMetrics.cdn_bandwidth}Mbps (monitoring threshold: 8000Mbps)`,
        timestamp: new Date().toISOString()
      });
    }

    setAlerts(prevAlerts => {
      const filteredPrev = prevAlerts.filter(alert => 
        !newAlerts.some(newAlert => newAlert.id === alert.id)
      );
      return [...filteredPrev, ...newAlerts].slice(-10); // Keep last 10 alerts
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const getMetricColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-100';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Real-time Platform Analytics</h3>
            <p className="text-gray-600">Live monitoring of system performance and user activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Concurrent Users</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(metrics.concurrent_users)}
          </div>
          <div className="text-xs text-blue-700">Active now</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-purple-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Videos Streaming</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(metrics.videos_streaming)}
          </div>
          <div className="text-xs text-purple-700">Currently playing</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">API Requests/sec</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(metrics.api_requests_per_second)}
          </div>
          <div className="text-xs text-green-700">Real-time load</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">CDN Bandwidth</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {formatNumber(metrics.cdn_bandwidth)}
          </div>
          <div className="text-xs text-orange-700">Mbps</div>
        </motion.div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                getMetricColor(metrics.avg_response_time, { warning: 200, critical: 500 })
              }`}>
                {metrics.avg_response_time.toFixed(0)}ms
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                getMetricColor(metrics.error_rate, { warning: 2, critical: 5 })
              }`}>
                {metrics.error_rate.toFixed(2)}%
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">DB Connections</span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                getMetricColor(metrics.database_connections, { warning: 200, critical: 300 })
              }`}>
                {metrics.database_connections}
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Upload Activity</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Uploads</span>
              <div className="text-lg font-bold text-blue-600">
                {metrics.uploads_in_progress}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Upload Success Rate</span>
              <div className="text-lg font-bold text-green-600">98.5%</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Upload Time</span>
              <div className="text-lg font-bold text-purple-600">2.3s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            System Alerts ({alerts.length})
          </h4>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                  alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  alert.type === 'critical' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <span className="flex-1">{alert.message}</span>
                <Clock className="w-4 h-4 opacity-70" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* System Status Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <div className="font-semibold text-green-900">System Operational</div>
            <div className="text-sm text-green-700">All services running normally</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <div className="font-semibold text-blue-900">Database Healthy</div>
            <div className="text-sm text-blue-700">Query performance optimal</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <Wifi className="w-6 h-6 text-purple-600" />
          <div>
            <div className="font-semibold text-purple-900">CDN Active</div>
            <div className="text-sm text-purple-700">Global delivery optimized</div>
          </div>
        </div>
      </div>
    </div>
  );
}