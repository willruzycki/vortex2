import React, { useState } from "react";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  Activity, 
  Shield, 
  Zap, 
  BarChart3, 
  Database, 
  Server,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useSidebar } from "@/components/SidebarContext";

import HealthMonitor from "../components/system/HealthMonitor";
import LoadTester from "../components/system/LoadTester";
import SecurityAudit from "../components/system/SecurityAudit";

export default function SystemDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("health");
  const [isLoading, setIsLoading] = useState(false);
  const { isDesktopSidebarOpen } = useSidebar();

  React.useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await User.me();
      if (currentUser.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(currentUser);
    } catch (error) {
      window.location.href = '/';
    }
  };

  const tabs = [
    { 
      id: "health", 
      name: "System Health", 
      icon: Activity,
      description: "Monitor all system services and performance"
    },
    { 
      id: "load", 
      name: "Load Testing", 
      icon: Zap,
      description: "Stress test the platform with simulated users"
    },
    { 
      id: "security", 
      name: "Security Audit", 
      icon: Shield,
      description: "Comprehensive security vulnerability assessment"
    }
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 text-lg">Loading system dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className={`mx-auto px-4 py-8 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-7xl' : 'max-w-full md:px-12'}`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">System Dashboard</h1>
              <p className="text-gray-600">Monitor, test, and secure the FIGMENT platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`p-6 rounded-xl text-left transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white shadow-lg border-2 border-blue-500 text-blue-600'
                    : 'bg-white shadow border border-gray-200 hover:shadow-md text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === tab.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <tab.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{tab.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{tab.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "health" && <HealthMonitor />}
          {activeTab === "load" && <LoadTester />}
          {activeTab === "security" && <SecurityAudit />}
        </motion.div>

        {/* Quick Stats Footer */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Platform Status</span>
            </div>
            <div className="text-2xl font-bold text-green-600">Operational</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Database</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">Healthy</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">CDN</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">Active</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Security</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">Protected</div>
          </div>
        </div>
      </div>
    </div>
  );
}