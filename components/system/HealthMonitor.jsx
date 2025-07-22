import React, { useState, useEffect } from "react";
import { SystemHealth, PerformanceMetrics } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Server, 
  Zap,
  Users,
  Play,
  Upload,
  Search,
  MessageSquare
} from "lucide-react";

export default function HealthMonitor() {
  const [healthStatus, setHealthStatus] = useState({});
  const [metrics, setMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      // Check health of all critical services
      const services = [
        'video_player',
        'upload_service', 
        'transcoding',
        'cdn',
        'database',
        'cache',
        'search',
        'recommendations',
        'notifications'
      ];

      const healthChecks = await Promise.allSettled(
        services.map(async (service) => {
          try {
            // Simulate health check - in real system this would ping actual services
            const startTime = Date.now();
            const responseTime = Math.random() * 200 + 50; // Simulate response time
            const errorRate = Math.random() * 5; // Simulate error rate
            
            await new Promise(resolve => setTimeout(resolve, 10)); // Simulate API call
            
            const status = responseTime > 500 ? 'degraded' : 
                          errorRate > 3 ? 'unhealthy' : 'healthy';
            
            return {
              service_name: service,
              status: status,
              response_time_ms: responseTime,
              error_rate_percent: errorRate,
              cpu_usage_percent: Math.random() * 80,
              memory_usage_percent: Math.random() * 70,
              active_connections: Math.floor(Math.random() * 1000),
              throughput: Math.floor(Math.random() * 500),
              last_checked: new Date().toISOString(),
              alerts_triggered: status !== 'healthy' ? [{
                alert_type: 'performance',
                message: `${service} showing degraded performance`,
                severity: 'medium',
                timestamp: new Date().toISOString()
              }] : []
            };
          } catch (error) {
            return {
              service_name: service,
              status: 'unhealthy',
              response_time_ms: 0,
              error_rate_percent: 100,
              last_checked: new Date().toISOString(),
              alerts_triggered: [{
                alert_type: 'service_down',
                message: `${service} is not responding`,
                severity: 'critical',
                timestamp: new Date().toISOString()
              }]
            };
          }
        })
      );

      const healthData = {};
      const allAlerts = [];
      
      healthChecks.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          healthData[data.service_name] = data;
          
          // Store health data for monitoring
          SystemHealth.create(data).catch(console.warn);
          
          if (data.alerts_triggered?.length > 0) {
            allAlerts.push(...data.alerts_triggered);
          }
        }
      });

      setHealthStatus(healthData);
      setAlerts(allAlerts);

      // Calculate overall system metrics
      const avgResponseTime = Object.values(healthData)
        .reduce((sum, service) => sum + service.response_time_ms, 0) / Object.keys(healthData).length;
      
      const totalThroughput = Object.values(healthData)
        .reduce((sum, service) => sum + service.throughput, 0);
      
      const healthyServices = Object.values(healthData)
        .filter(service => service.status === 'healthy').length;
      
      setMetrics({
        avgResponseTime,
        totalThroughput,
        healthyServices,
        totalServices: Object.keys(healthData).length,
        overallHealth: (healthyServices / Object.keys(healthData).length) * 100
      });

    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-100';
      case 'degraded': return 'text-yellow-500 bg-yellow-100';
      case 'unhealthy': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const serviceIcons = {
    video_player: Play,
    upload_service: Upload,
    transcoding: Zap,
    cdn: Server,
    database: Database,
    cache: Activity,
    search: Search,
    recommendations: Users,
    notifications: MessageSquare
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">System Health Dashboard</h3>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            metrics.overallHealth > 90 ? 'bg-green-100 text-green-800' :
            metrics.overallHealth > 70 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <Activity className="w-4 h-4" />
            <span className="font-semibold">{metrics.overallHealth?.toFixed(1)}% Healthy</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{metrics.avgResponseTime?.toFixed(0)}ms</div>
          <div className="text-sm text-blue-800">Avg Response Time</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{metrics.totalThroughput}</div>
          <div className="text-sm text-green-800">Requests/sec</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{metrics.healthyServices}/{metrics.totalServices}</div>
          <div className="text-sm text-purple-800">Services Up</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{alerts.length}</div>
          <div className="text-sm text-orange-800">Active Alerts</div>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(healthStatus).map(([serviceName, service]) => {
          const IconComponent = serviceIcons[serviceName] || Activity;
          return (
            <motion.div
              key={serviceName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {serviceName.replace('_', ' ')}
                    </h4>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  {service.status}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Response:</span>
                  <span className="font-medium ml-1">{service.response_time_ms?.toFixed(0)}ms</span>
                </div>
                <div>
                  <span className="text-gray-600">Error Rate:</span>
                  <span className="font-medium ml-1">{service.error_rate_percent?.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">CPU:</span>
                  <span className="font-medium ml-1">{service.cpu_usage_percent?.toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Memory:</span>
                  <span className="font-medium ml-1">{service.memory_usage_percent?.toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-3">Active Alerts</h4>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-800">{alert.message}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  alert.severity === 'critical' ? 'bg-red-200 text-red-900' :
                  alert.severity === 'high' ? 'bg-orange-200 text-orange-900' :
                  'bg-yellow-200 text-yellow-900'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}