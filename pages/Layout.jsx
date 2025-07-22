

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Notification, User } from "@/api/entities";
import { 
  Home, 
  Search, 
  PlusCircle, 
  User as UserIcon, 
  Sparkles,
  Film,
  TrendingUp,
  Menu,
  Bell,
  MessageCircle,
  BarChart3,
  Shield,
  X,
  Settings,
  LogOut,
  Edit
} from "lucide-react";
import { SidebarContext } from "@/components/SidebarContext";

import PrivacyConsent from "./components/privacy/PrivacyConsent";
import PerformanceMonitor from "./components/performance/PerformanceMonitor";
import SecurityGuard from "./components/security/SecurityGuard";

const navigationItems = [
  {
    title: "For You",
    url: createPageUrl("Feed"),
    icon: Home,
  },
  {
    title: "Discover",
    url: createPageUrl("Discover"),
    icon: Search
  },
  {
    title: "Create",
    url: createPageUrl("Create"),
    icon: PlusCircle
  },
  {
    title: "Profile",
    url: createPageUrl("MyProfile"),
    icon: UserIcon
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // On initial load, set sidebar state ONLY from saved user preference
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    setIsDesktopSidebarOpen(savedState === 'true');
    loadUser();
  }, []);

  // Whenever sidebar state changes, save the preference
  useEffect(() => {
    localStorage.setItem('sidebarOpen', isDesktopSidebarOpen.toString());
  }, [isDesktopSidebarOpen]);

  useEffect(() => {
    if (user) {
      loadNotificationCount();
      const interval = setInterval(loadNotificationCount, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      // User not authenticated
    }
  };

  const loadNotificationCount = async () => {
    try {
      const notifications = await Notification.filter({ user_id: user.id, is_read: false });
      setUnreadNotifications(notifications.length);
    } catch (error) {
      // Degrade gracefully. Don't show a critical error for a background network issue.
      if (error.message && error.message.includes("Network Error")) {
        console.warn("Could not fetch notification count due to a network issue. This is non-critical.");
      } else {
        console.error("Error loading notification count:", error);
      }
    }
  };

  const handleHeaderSearch = (e) => {
    if (e.key === 'Enter' && headerSearchQuery.trim() !== '') {
      window.location.href = createPageUrl(`Feed?q=${encodeURIComponent(headerSearchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      setIsMobileSidebarOpen(false);
      // Redirect to home page after logout to ensure a clean state
      window.location.href = createPageUrl('Feed');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  return (
    <SidebarContext.Provider value={{ isDesktopSidebarOpen, setIsDesktopSidebarOpen }}>
      <SecurityGuard>
        <PerformanceMonitor />
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Mobile Sidebar */}
          <div className={`fixed left-0 top-0 h-full w-80 z-50 md:hidden transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="w-full h-full bg-white border-r border-slate-200 overflow-y-auto">
              <div className="p-6">
                {/* Header with Close Button */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/023b44fdb_IMG_5940.jpg" alt="FIGMENT Logo" className="w-10 h-10 object-contain mix-blend-multiply"/>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">FIGMENT</h1>
                      <p className="text-sm text-gray-600">The Home for AI-Generated Creativity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* User Profile Section */}
                {user && (
                  <div className="mb-8 p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.full_name || 'User'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to={createPageUrl("EditProfile")}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </div>
                )}

                {/* Main Navigation */}
                <nav className="space-y-2 mb-8">
                  <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wide">Main</h3>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                            : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Creator Tools Section */}
                {user && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wide">Creator Tools</h3>
                    <div className="space-y-2">
                      <Link 
                        to={createPageUrl("CreatorStudio")}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-medium">Creator Studio</span>
                      </Link>
                      <Link 
                        to={createPageUrl("Messages")}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">Messages</span>
                      </Link>
                      <Link 
                        to={createPageUrl("Notifications")}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative"
                      >
                        <Bell className="w-5 h-5" />
                        <span className="font-medium">Notifications</span>
                        {unreadNotifications > 0 && (
                          <div className="absolute right-4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Admin Section */}
                {user && user.role === 'admin' && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wide">Admin</h3>
                    <div className="space-y-2">
                      <Link 
                        to={createPageUrl("AdminDashboard")}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                      >
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Admin Dashboard</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Quick Access */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wide">Quick Access</h3>
                  <div className="space-y-2">
                    <Link 
                      to={createPageUrl("Feed")} 
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                    >
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-medium">Trending</span>
                    </Link>
                    <Link 
                      to={createPageUrl("Feed")} 
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">AI Originals</span>
                    </Link>
                    <Link 
                      to={createPageUrl("Feed")} 
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                    >
                      <Film className="w-5 h-5" />
                      <span className="font-medium">Creator Series</span>
                    </Link>
                  </div>
                </div>

                {/* Account Actions */}
                {user && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wide">Account</h3>
                    <div className="space-y-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 transition-colors text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl w-full text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Login Section for Unauthenticated Users */}
                {!user && (
                  <div className="border-t border-slate-200 pt-6">
                    <button
                      onClick={async () => {
                        try {
                          await User.login();
                        } catch (error) {
                          console.error("Login error:", error);
                        }
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                    >
                      Sign In to FIGMENT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className={`hidden md:block fixed left-0 top-0 h-full w-64 z-40 transition-transform duration-300 ease-in-out ${isDesktopSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="w-full h-full bg-white border-r border-slate-200">
              <div className="p-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 h-8">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/023b44fdb_IMG_5940.jpg" alt="FIGMENT Logo" className="w-10 h-10 object-contain mix-blend-multiply"/>
                  <div>
                    <h1 className="text-2xl font-medium uppercase">FIGMENT</h1>
                    <p className="text-sm text-gray-600">The Home for AI-Generated Creativity</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 mt-12">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Additional Navigation for Authenticated Users */}
                {user && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold mb-3 text-gray-600">Creator Tools</h3>
                    <div className="space-y-2">
                      <Link 
                        to={createPageUrl("CreatorStudio")} 
                        className="flex items-center gap-3 px-4 py-2 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">Creator Studio</span>
                      </Link>
                      <Link 
                        to={createPageUrl("Messages")} 
                        className="flex items-center gap-3 px-4 py-2 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Messages</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link 
                          to={createPageUrl("AdminDashboard")} 
                          className="flex items-center gap-3 px-4 py-2 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">Admin Dashboard</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Access */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-semibold mb-3 text-gray-600">Quick Access</h3>
                  <div className="space-y-2">
                    <Link 
                      to={createPageUrl("Feed")} 
                      className="flex items-center gap-3 px-4 py-2 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Trending</span>
                    </Link>
                    <Link 
                      to={createPageUrl("Feed")} 
                      className="flex items-center gap-3 px-4 py-2 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">AI Originals</span>
                    </Link>
                    <Link 
                      to={createPageUrl("Feed")} 
                      className="flex items-center gap-3 px-4 py-2 transition-colors text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      <Film className="w-4 h-4" />
                      <span className="text-sm">Creator Series</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className={`bg-slate-50 text-slate-900 relative z-10 min-h-screen transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
            {/* Mobile Header */}
            <header className="bg-slate-50 text-slate-900 p-4 flex md:hidden items-center justify-between h-16 sticky top-0 backdrop-blur-xl z-30 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileSidebarOpen(true)} 
                  className="p-2 rounded-full transition-colors hover:bg-slate-200 text-slate-800"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/023b44fdb_IMG_5940.jpg" alt="FIGMENT Logo" className="w-8 h-8 object-contain mix-blend-multiply"/>
                <h1 className="text-xl font-semibold uppercase">FIGMENT</h1>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    onKeyPress={handleHeaderSearch}
                    className="bg-slate-100 border border-slate-200 rounded-full pl-9 pr-3 py-2 w-40 text-slate-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </header>

            {/* Desktop Header with Toggle */}
            <header className="bg-slate-50 text-slate-900 p-4 hidden md:flex items-center justify-between h-16 sticky top-0 backdrop-blur-xl z-30 border-b border-slate-200">
              <div className="flex items-center">
                <button 
                  onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} 
                  className="p-2 rounded-full transition-colors hover:bg-slate-200 text-slate-800"
                  aria-label={isDesktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  <Menu className="w-6 h-6" />
                </button>
                {/* Show a mini logo/title when sidebar is closed */}
                <div className="flex items-center gap-3 ml-4">
                  {!isDesktopSidebarOpen && (
                    <>
                      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/023b44fdb_IMG_5940.jpg" alt="FIGMENT Logo" className="w-12 h-12 object-contain mix-blend-multiply"/>
                      <h1 className="text-2xl font-semibold uppercase">FIGMENT</h1>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Conditional Search Bar for VideoPlayer page */}
                {currentPageName !== 'VideoPlayer' && (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search FIGMENT"
                      value={headerSearchQuery}
                      onChange={(e) => setHeaderSearchQuery(e.target.value)}
                      onKeyPress={handleHeaderSearch}
                      className="bg-slate-100 border border-slate-200 rounded-full pl-11 pr-4 py-2 w-72 text-slate-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}

                {/* Notifications Bell */}
                {user && (
                  <Link
                    to={createPageUrl("Notifications")}
                    className="relative p-2 rounded-full transition-colors hover:bg-slate-200 text-slate-800"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadNotifications > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </div>
                    )}
                  </Link>
                )}
              </div>
            </header>

            {/* Page Content */}
            {children}
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200">
              <div className="flex items-center justify-around px-4 py-3">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex flex-col items-center justify-center transition-colors text-xs gap-1 ${
                        isActive ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="flex flex-col items-center justify-center transition-colors text-xs gap-1 text-gray-600 hover:text-red-500"
                >
                  <Menu className="w-6 h-6" />
                  <span>More</span>
                </button>
              </div>
            </div>
          </div>

          <style jsx>{`
            .glassmorphism {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .glassmorphism-dark {
              background: rgba(0, 0, 0, 0.4);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
          `}</style>
        </div>
        
        <PrivacyConsent />
        
      </SecurityGuard>
    </SidebarContext.Provider>
  );
}

