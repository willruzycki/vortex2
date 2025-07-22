import React, { useState, useEffect } from "react";
import { Video, User, VideoInteraction, Analytics, Subscription } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Calendar,
  Video as VideoIcon,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { useSidebar } from "@/components/SidebarContext";

export default function CreatorStudio() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalRevenue: 0,
    totalSubscribers: 0,
    totalVideos: 0,
    avgEngagement: 0,
    monthlyGrowth: 0
  });
  const [recentInteractions, setRecentInteractions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { isDesktopSidebarOpen } = useSidebar();

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load creator's videos
      const userVideos = await Video.filter({ created_by: currentUser.email }, "-created_date");
      setVideos(userVideos);

      // Load subscriber count
      const subscribers = await Subscription.filter({ channel_id: currentUser.id });
      
      // Calculate analytics
      const totalViews = userVideos.reduce((sum, video) => sum + (video.views || 0), 0);
      const totalRevenue = userVideos.reduce((sum, video) => sum + (video.revenue || 0), 0);
      const totalLikes = userVideos.reduce((sum, video) => sum + (video.likes || 0), 0);
      const avgEngagement = userVideos.length > 0 ? (totalLikes / totalViews) * 100 : 0;

      setAnalytics({
        totalViews,
        totalRevenue,
        totalSubscribers: subscribers.length,
        totalVideos: userVideos.length,
        avgEngagement: avgEngagement.toFixed(2),
        monthlyGrowth: 12.5 // This would be calculated from historical data
      });

      // Load recent interactions
      const interactions = await VideoInteraction.filter(
        { video_id: userVideos.map(v => v.id) }, 
        "-timestamp", 
        20
      );
      setRecentInteractions(interactions);

    } catch (error) {
      console.error("Error loading creator data:", error);
    }
    setIsLoading(false);
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4" />
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </motion.div>
  );

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
    { id: "monetization", name: "Monetization", icon: DollarSign },
    { id: "audience", name: "Audience", icon: Users }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 text-lg">Loading creator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className={`mx-auto px-4 py-8 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-6xl' : 'max-w-full md:px-12'}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Creator Studio</h1>
          <p className="text-gray-600">Manage your content and track your performance</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-gray-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Views"
                value={analytics.totalViews.toLocaleString()}
                icon={Eye}
                color="bg-blue-500"
                change={analytics.monthlyGrowth}
              />
              <StatCard
                title="Subscribers"
                value={analytics.totalSubscribers.toLocaleString()}
                icon={Users}
                color="bg-purple-500"
                change={8.2}
              />
              <StatCard
                title="Revenue"
                value={`$${analytics.totalRevenue.toFixed(2)}`}
                icon={DollarSign}
                color="bg-green-500"
                change={15.7}
              />
              <StatCard
                title="Videos"
                value={analytics.totalVideos}
                icon={VideoIcon}
                color="bg-red-500"
              />
            </div>

            {/* Recent Videos */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Videos</h3>
              <div className="space-y-4">
                {videos.slice(0, 5).map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-16 h-12 bg-black rounded-lg flex items-center justify-center">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <VideoIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{video.title}</h4>
                      <p className="text-sm text-gray-600">{format(new Date(video.created_date), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {video.views || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {video.likes || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{analytics.avgEngagement}%</div>
                  <div className="text-sm text-gray-600">Avg. Engagement Rate</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{(analytics.totalViews / analytics.totalVideos || 0).toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Avg. Views per Video</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{analytics.monthlyGrowth}%</div>
                  <div className="text-sm text-gray-600">Monthly Growth</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monetization Tab */}
        {activeTab === "monetization" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Revenue Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white">
                  <h4 className="text-lg font-semibold mb-2">Total Revenue</h4>
                  <div className="text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
                  <p className="text-green-100 text-sm">This month</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white">
                  <h4 className="text-lg font-semibold mb-2">Subscriber Revenue</h4>
                  <div className="text-3xl font-bold">${(analytics.totalSubscribers * 4.99).toFixed(2)}</div>
                  <p className="text-purple-100 text-sm">Estimated monthly</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Subscription Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl">
                  <h4 className="font-semibold text-slate-900">Supporter</h4>
                  <div className="text-2xl font-bold text-green-600">$4.99/mo</div>
                  <p className="text-sm text-gray-600">Basic perks and early access</p>
                </div>
                <div className="p-4 border border-purple-200 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-slate-900">VIP</h4>
                  <div className="text-2xl font-bold text-purple-600">$9.99/mo</div>
                  <p className="text-sm text-gray-600">Exclusive content and Discord access</p>
                </div>
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
                  <h4 className="font-semibold text-slate-900">Premium</h4>
                  <div className="text-2xl font-bold text-yellow-600">$19.99/mo</div>
                  <p className="text-sm text-gray-600">One-on-one sessions and custom content</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === "audience" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Audience Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-4">Top Countries</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>United States</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Canada</span>
                      <span className="font-semibold">18%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>United Kingdom</span>
                      <span className="font-semibold">12%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-4">Age Demographics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>18-24</span>
                      <span className="font-semibold">32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>25-34</span>
                      <span className="font-semibold">41%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>35-44</span>
                      <span className="font-semibold">18%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}