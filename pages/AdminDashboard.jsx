import React, { useState, useEffect } from "react";
import { Report, Video, User, Comment } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Flag,
  Users,
  MessageSquare,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { useSidebar } from "@/components/SidebarContext";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");
  const [selectedReport, setSelectedReport] = useState(null);
  const { isDesktopSidebarOpen } = useSidebar();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await User.me();
      if (currentUser.role !== 'admin') {
        // Redirect non-admins
        window.location.href = '/';
        return;
      }
      setUser(currentUser);
      loadReports();
    } catch (error) {
      console.error("Error checking admin access:", error);
      window.location.href = '/';
    }
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const allReports = await Report.list("-created_date", 100);
      setReports(allReports);
      
      const pending = allReports.filter(report => report.status === 'pending');
      setPendingReports(pending);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
    setIsLoading(false);
  };

  const handleReportAction = async (reportId, action, adminNotes = '') => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      await Report.update(reportId, {
        status: 'reviewed',
        action_taken: action,
        admin_notes: adminNotes
      });

      // If removing content, update the content status
      if (action === 'content_removed' && report.content_type === 'video') {
        await Video.update(report.content_id, {
          processing_status: 'removed',
          moderation_status: 'removed'
        });
      }

      // Reload reports
      loadReports();
      setSelectedReport(null);
    } catch (error) {
      console.error("Error processing report:", error);
    }
  };

  const ReportCard = ({ report }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => setSelectedReport(report)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            report.reason === 'hate_speech' ? 'bg-red-100 text-red-600' :
            report.reason === 'spam' ? 'bg-yellow-100 text-yellow-600' :
            'bg-orange-100 text-orange-600'
          }`}>
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 capitalize">{report.reason.replace('_', ' ')}</h3>
            <p className="text-sm text-gray-600">{report.content_type} reported</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {report.status}
        </div>
      </div>
      
      <p className="text-gray-700 mb-3 line-clamp-2">{report.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Reported by User #{report.reporter_id.slice(-6)}</span>
        <span>{format(new Date(report.created_date), 'MMM d, h:mm a')}</span>
      </div>
    </motion.div>
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className={`mx-auto px-4 py-8 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-6xl' : 'max-w-full md:px-12'}`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage content moderation and platform safety</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Reports"
            value={pendingReports.length}
            icon={AlertTriangle}
            color="bg-yellow-500"
          />
          <StatCard
            title="Total Reports"
            value={reports.length}
            icon={Flag}
            color="bg-red-500"
          />
          <StatCard
            title="Resolved Today"
            value={reports.filter(r => 
              r.status === 'resolved' && 
              new Date(r.updated_date).toDateString() === new Date().toDateString()
            ).length}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Actions Taken"
            value={reports.filter(r => r.action_taken && r.action_taken !== 'none').length}
            icon={Shield}
            color="bg-purple-500"
          />
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Content Reports</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "reports" 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Reports
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "pending" 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending ({pendingReports.length})
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {(activeTab === "pending" ? pendingReports : reports).map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Reason</label>
                  <p className="text-slate-900 capitalize">{selectedReport.reason.replace('_', ' ')}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-slate-900">{selectedReport.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Content Type</label>
                  <p className="text-slate-900 capitalize">{selectedReport.content_type}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Reported Date</label>
                  <p className="text-slate-900">{format(new Date(selectedReport.created_date), 'PPpp')}</p>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'none', 'No action needed')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'warning', 'Warning issued to user')}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Warning
                    </button>
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'content_removed', 'Content removed for policy violation')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Remove Content
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}