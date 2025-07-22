import React, { useState, useEffect } from "react";
import { ContentModerationQueue, Video, Comment, Report } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Zap,
  Brain,
  Flag,
  MessageSquare,
  Play
} from "lucide-react";

export default function ContentModerationAI() {
  const [moderationQueue, setModerationQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStats, setAiStats] = useState({
    total_processed: 0,
    auto_approved: 0,
    flagged_for_review: 0,
    blocked_content: 0,
    accuracy_rate: 0
  });
  const [activeFilters, setActiveFilters] = useState({
    priority: 'all',
    content_type: 'all',
    status: 'pending'
  });

  useEffect(() => {
    loadModerationQueue();
    loadAIStats();
  }, [activeFilters]);

  const loadModerationQueue = async () => {
    try {
      let filters = { status: activeFilters.status };
      
      if (activeFilters.priority !== 'all') {
        filters.priority = activeFilters.priority;
      }
      
      if (activeFilters.content_type !== 'all') {
        filters.content_type = activeFilters.content_type;
      }

      const queue = await ContentModerationQueue.filter(filters, "-review_deadline", 20);
      setModerationQueue(queue);
    } catch (error) {
      console.error('Failed to load moderation queue:', error);
    }
  };

  const loadAIStats = async () => {
    try {
      // Simulate AI moderation statistics
      setAiStats({
        total_processed: 15847,
        auto_approved: 14325,
        flagged_for_review: 1205,
        blocked_content: 317,
        accuracy_rate: 94.2
      });
    } catch (error) {
      console.error('Failed to load AI stats:', error);
    }
  };

  const runAIModerationBatch = async () => {
    setIsProcessing(true);
    
    try {
      const pendingItems = moderationQueue.filter(item => item.status === 'pending');
      
      for (const item of pendingItems.slice(0, 5)) { // Process 5 at a time
        await processContentWithAI(item);
      }
      
      await loadModerationQueue();
      await loadAIStats();
    } catch (error) {
      console.error('Batch AI moderation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processContentWithAI = async (item) => {
    try {
      let contentToAnalyze = '';
      let contentMetadata = {};

      // Get content based on type
      switch (item.content_type) {
        case 'video':
          const video = await Video.filter({ id: item.content_id });
          if (video.length > 0) {
            contentToAnalyze = `Title: ${video[0].title}\nDescription: ${video[0].description || ''}\nTags: ${(video[0].tags || []).join(', ')}`;
            contentMetadata = {
              duration: video[0].duration,
              category: video[0].category,
              is_ai_generated: video[0].is_ai_generated
            };
          }
          break;
          
        case 'comment':
          const comment = await Comment.filter({ id: item.content_id });
          if (comment.length > 0) {
            contentToAnalyze = comment[0].content;
          }
          break;
          
        default:
          contentToAnalyze = 'Content type not supported for AI analysis';
      }

      // AI Content Analysis
      const aiResponse = await InvokeLLM({
        prompt: `
        Analyze this content for potential policy violations. Provide scores (0-100) for each category:

        Content to analyze:
        ${contentToAnalyze}

        Metadata: ${JSON.stringify(contentMetadata)}

        Evaluate for:
        1. Inappropriate content (violence, adult content)
        2. Hate speech or harassment  
        3. Spam or misleading content
        4. Copyright concerns
        5. Community guidelines violations

        Also provide:
        - Overall risk score (0-100)
        - Recommended action (approve/review/block)
        - Reasoning for the decision
        `,
        response_json_schema: {
          type: "object",
          properties: {
            inappropriate_content: { type: "number" },
            hate_speech: { type: "number" },
            spam: { type: "number" },
            copyright_risk: { type: "number" },
            community_violations: { type: "number" },
            overall_risk_score: { type: "number" },
            recommended_action: { 
              type: "string", 
              enum: ["approve", "review", "block"] 
            },
            reasoning: { type: "string" },
            confidence_level: { type: "number" }
          }
        }
      });

      // Update moderation queue item with AI results
      const aiScores = {
        inappropriate_content: aiResponse.inappropriate_content || 0,
        hate_speech: aiResponse.hate_speech || 0,
        violence: 0,
        adult_content: aiResponse.inappropriate_content || 0,
        spam: aiResponse.spam || 0,
        copyright_risk: aiResponse.copyright_risk || 0
      };

      let newStatus = 'under_review';
      let actionTaken = 'approved';

      // Decision logic based on AI analysis
      if (aiResponse.overall_risk_score > 80 || aiResponse.recommended_action === 'block') {
        newStatus = 'rejected';
        actionTaken = 'removed';
      } else if (aiResponse.overall_risk_score > 50 || aiResponse.recommended_action === 'review') {
        newStatus = 'escalated';
        actionTaken = 'age_restricted';
      } else if (aiResponse.recommended_action === 'approve') {
        newStatus = 'approved';
        actionTaken = 'approved';
      }

      await ContentModerationQueue.update(item.id, {
        status: newStatus,
        ai_confidence_scores: aiScores,
        moderation_notes: `AI Analysis: ${aiResponse.reasoning}`,
        action_taken: actionTaken
      });

    } catch (error) {
      console.error(`Failed to process content ${item.id}:`, error);
      
      // Update with error status
      await ContentModerationQueue.update(item.id, {
        status: 'escalated',
        moderation_notes: `AI processing failed: ${error.message}`,
        priority: 'high'
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'escalated': return 'text-orange-600 bg-orange-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'user_profile': return <Eye className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Content Moderation</h3>
            <p className="text-gray-600">Automated content analysis and policy enforcement</p>
          </div>
        </div>
        <Button 
          onClick={runAIModerationBatch} 
          disabled={isProcessing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isProcessing ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run AI Batch
            </>
          )}
        </Button>
      </div>

      {/* AI Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{aiStats.total_processed.toLocaleString()}</div>
          <div className="text-sm text-blue-800">Total Processed</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{aiStats.auto_approved.toLocaleString()}</div>
          <div className="text-sm text-green-800">Auto Approved</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{aiStats.flagged_for_review.toLocaleString()}</div>
          <div className="text-sm text-yellow-800">Flagged for Review</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{aiStats.blocked_content.toLocaleString()}</div>
          <div className="text-sm text-red-800">Blocked Content</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{aiStats.accuracy_rate}%</div>
          <div className="text-sm text-purple-800">Accuracy Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={activeFilters.priority}
          onChange={(e) => setActiveFilters(prev => ({ ...prev, priority: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={activeFilters.content_type}
          onChange={(e) => setActiveFilters(prev => ({ ...prev, content_type: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Content Types</option>
          <option value="video">Videos</option>
          <option value="comment">Comments</option>
          <option value="user_profile">User Profiles</option>
          <option value="thumbnail">Thumbnails</option>
        </select>

        <select
          value={activeFilters.status}
          onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {/* Moderation Queue */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Content Moderation Queue ({moderationQueue.length})</h4>
        
        {moderationQueue.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>No content in moderation queue</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {moderationQueue.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getContentIcon(item.content_type)}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 capitalize">
                        {item.content_type.replace('_', ' ')} Content
                      </h5>
                      <p className="text-sm text-gray-600">ID: {item.content_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* AI Confidence Scores */}
                {item.ai_confidence_scores && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    {Object.entries(item.ai_confidence_scores).map(([category, score]) => (
                      <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                        <div className={`text-xs font-bold px-2 py-1 rounded ${
                          score > 70 ? 'bg-red-100 text-red-800' :
                          score > 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {score}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Moderation Notes */}
                {item.moderation_notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{item.moderation_notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}