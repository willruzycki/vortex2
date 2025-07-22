import React, { useState, useEffect } from "react";
import { Notification, User } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Video,
  CheckCircle,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { useSidebar } from "@/components/SidebarContext";

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isDesktopSidebarOpen } = useSidebar();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not authenticated");
    }
  };

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const userNotifications = await Notification.filter(
        { user_id: user.id },
        "-created_date",
        50
      );
      setNotifications(userNotifications);
      
      const unread = userNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
    setIsLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => Notification.update(n.id, { is_read: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await Notification.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_video':
        return <Video className="w-5 h-5" />;
      case 'new_subscriber':
        return <UserPlus className="w-5 h-5" />;
      case 'video_liked':
        return <Heart className="w-5 h-5" />;
      case 'video_commented':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_video':
        return 'bg-blue-500';
      case 'new_subscriber':
        return 'bg-purple-500';
      case 'video_liked':
        return 'bg-pink-500';
      case 'video_commented':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 text-lg">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className={`mx-auto px-4 py-8 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-4xl' : 'max-w-full md:px-12'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Notifications</h3>
              <p className="text-gray-600">We'll notify you when something happens!</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl p-4 shadow-lg border-l-4 ${
                  !notification.is_read 
                    ? 'border-red-500 bg-red-50/30' 
                    : 'border-gray-200'
                } hover:shadow-xl transition-all cursor-pointer`}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
                  if (notification.action_url) {
                    window.location.href = notification.action_url;
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center text-white flex-shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1">{notification.title}</h3>
                    <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                    <p className="text-gray-500 text-xs">
                      {format(new Date(notification.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}