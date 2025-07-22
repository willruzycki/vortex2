import React, { useState, useEffect } from "react";
import { UserRecommendation, Video, VideoInteraction, User, UserBehaviorPattern } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Target, 
  Zap,
  BarChart3,
  Play,
  Heart,
  Clock
} from "lucide-react";

export default function RecommendationEngine() {
  const [recommendationStats, setRecommendationStats] = useState({
    total_users: 0,
    recommendations_generated: 0,
    click_through_rate: 0,
    engagement_improvement: 0,
    processing_queue: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [engineConfig, setEngineConfig] = useState({
    algorithm: 'hybrid',
    weights: {
      collaborative_filtering: 0.4,
      content_based: 0.3,
      trending_boost: 0.2,
      diversity_factor: 0.1
    },
    personalization_level: 'high',
    refresh_interval: 24 // hours
  });
  const [recentRecommendations, setRecentRecommendations] = useState([]);

  useEffect(() => {
    loadRecommendationStats();
    loadRecentRecommendations();
  }, []);

  const loadRecommendationStats = async () => {
    try {
      // Simulate recommendation statistics
      setRecommendationStats({
        total_users: 45623,
        recommendations_generated: 152847,
        click_through_rate: 18.7,
        engagement_improvement: 34.2,
        processing_queue: 1247
      });
    } catch (error) {
      console.error('Failed to load recommendation stats:', error);
    }
  };

  const loadRecentRecommendations = async () => {
    try {
      const recent = await UserRecommendation.list('-last_updated', 10);
      setRecentRecommendations(recent);
    } catch (error) {
      console.error('Failed to load recent recommendations:', error);
    }
  };

  const generateBatchRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      // Get users who need recommendation updates
      const users = await User.list('-last_active', 100);
      
      let processedCount = 0;
      
      for (const user of users.slice(0, 20)) { // Process 20 users at a time
        try {
          await generateUserRecommendations(user);
          processedCount++;
          
          // Update progress (in real app, you'd use a progress callback)
          if (processedCount % 5 === 0) {
            console.log(`Processed ${processedCount} users...`);
          }
        } catch (error) {
          console.error(`Failed to generate recommendations for user ${user.id}:`, error);
        }
      }
      
      await loadRecommendationStats();
      await loadRecentRecommendations();
      
    } catch (error) {
      console.error('Batch recommendation generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateUserRecommendations = async (user) => {
    try {
      // 1. Analyze user behavior patterns
      const userBehavior = await analyzeUserBehavior(user);
      
      // 2. Get user's interaction history
      const interactions = await VideoInteraction.filter(
        { user_id: user.id }, 
        '-timestamp', 
        50
      );
      
      // 3. Get all available videos
      const allVideos = await Video.list('-created_date', 500);
      
      // 4. Generate recommendations using AI
      const recommendations = await generateAIRecommendations(user, userBehavior, interactions, allVideos);
      
      // 5. Store recommendations
      await UserRecommendation.create({
        user_id: user.id,
        recommended_videos: recommendations.video_ids,
        recommendation_score: recommendations.confidence_score,
        categories_preference: recommendations.preferred_categories,
        last_updated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`Failed to generate recommendations for user ${user.id}:`, error);
      throw error;
    }
  };

  const analyzeUserBehavior = async (user) => {
    try {
      // Get or create user behavior pattern
      const existingPatterns = await UserBehaviorPattern.filter({ user_id: user.id });
      
      if (existingPatterns.length > 0) {
        return existingPatterns[0];
      }
      
      // Create default behavior pattern
      const behaviorPattern = {
        user_id: user.id,
        engagement_score: 50,
        preferred_categories: ['video', 'shorts'],
        viewing_patterns: {
          peak_viewing_hours: [19, 20, 21], // 7-9 PM
          average_session_duration: 15,
          videos_per_session: 5,
          completion_rate: 0.7,
          skip_rate: 0.3
        },
        content_preferences: {
          ai_generated_preference: 0.5,
          video_length_preference: 'mixed',
          quality_preference: 'auto'
        },
        interaction_patterns: {
          like_rate: 0.15,
          comment_rate: 0.05,
          share_rate: 0.02,
          subscription_rate: 0.01
        },
        churn_risk_score: 25,
        last_updated: new Date().toISOString()
      };
      
      await UserBehaviorPattern.create(behaviorPattern);
      return behaviorPattern;
      
    } catch (error) {
      console.error('Failed to analyze user behavior:', error);
      return null;
    }
  };

  const generateAIRecommendations = async (user, behaviorPattern, interactions, allVideos) => {
    try {
      // Prepare data for AI analysis
      const likedVideos = interactions
        .filter(i => i.interaction_type === 'like')
        .map(i => allVideos.find(v => v.id === i.video_id))
        .filter(Boolean)
        .slice(0, 10);
      
      const watchedVideos = interactions
        .filter(i => i.interaction_type === 'view')
        .map(i => allVideos.find(v => v.id === i.video_id))
        .filter(Boolean)
        .slice(0, 20);

      const candidateVideos = allVideos
        .filter(video => !interactions.some(i => i.video_id === video.id))
        .slice(0, 100);

      // Use AI to generate personalized recommendations
      const aiResponse = await InvokeLLM({
        prompt: `
        Generate personalized video recommendations for a user based on their behavior and preferences.

        User Profile:
        - Engagement Score: ${behaviorPattern?.engagement_score || 50}
        - Preferred Categories: ${behaviorPattern?.preferred_categories?.join(', ') || 'general'}
        - Content Preferences: ${JSON.stringify(behaviorPattern?.content_preferences || {})}
        - Viewing Patterns: ${JSON.stringify(behaviorPattern?.viewing_patterns || {})}

        Liked Videos (titles and categories):
        ${likedVideos.map(v => `"${v.title}" (${v.category || 'general'})`).join('\n')}

        Recently Watched:
        ${watchedVideos.map(v => `"${v.title}" (${v.category || 'general'})`).join('\n')}

        Available Videos to Recommend:
        ${candidateVideos.slice(0, 50).map(v => `ID: ${v.id}, Title: "${v.title}", Category: ${v.category || 'general'}, Views: ${v.views || 0}, AI Generated: ${v.is_ai_generated || false}`).join('\n')}

        Please recommend 10 videos that would be most engaging for this user. Consider:
        1. Content similarity to liked videos
        2. User's preferred categories and viewing patterns
        3. Mix of popular and niche content
        4. Diversity to avoid filter bubbles
        5. User's AI content preference

        Return the video IDs, confidence score, and reasoning.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            video_ids: { 
              type: "array", 
              items: { type: "string" },
              maxItems: 10
            },
            confidence_score: { type: "number" },
            preferred_categories: { 
              type: "array", 
              items: { type: "string" }
            },
            reasoning: { type: "string" },
            diversity_score: { type: "number" },
            personalization_level: { type: "string" }
          }
        }
      });

      return {
        video_ids: aiResponse.video_ids || [],
        confidence_score: aiResponse.confidence_score || 50,
        preferred_categories: aiResponse.preferred_categories || [],
        reasoning: aiResponse.reasoning || 'AI-generated recommendations',
        diversity_score: aiResponse.diversity_score || 50
      };

    } catch (error) {
      console.error('AI recommendation generation failed:', error);
      
      // Fallback to simple recommendation logic
      return {
        video_ids: allVideos.slice(0, 10).map(v => v.id),
        confidence_score: 25,
        preferred_categories: ['general'],
        reasoning: 'Fallback recommendations due to AI processing error'
      };
    }
  };

  const updateEngineConfig = async (newConfig) => {
    setEngineConfig(newConfig);
    // In a real system, this would update the recommendation engine configuration
    console.log('Updated recommendation engine config:', newConfig);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-indigo-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Recommendation Engine</h3>
            <p className="text-gray-600">Personalized content discovery and user engagement optimization</p>
          </div>
        </div>
        <Button 
          onClick={generateBatchRecommendations} 
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isGenerating ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Batch
            </>
          )}
        </Button>
      </div>

      {/* Engine Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {recommendationStats.total_users.toLocaleString()}
          </div>
          <div className="text-sm text-blue-800">Total Users</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {recommendationStats.recommendations_generated.toLocaleString()}
          </div>
          <div className="text-sm text-green-800">Recommendations</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {recommendationStats.click_through_rate}%
          </div>
          <div className="text-sm text-purple-800">Click Through Rate</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            +{recommendationStats.engagement_improvement}%
          </div>
          <div className="text-sm text-orange-800">Engagement Boost</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {recommendationStats.processing_queue}
          </div>
          <div className="text-sm text-yellow-800">In Queue</div>
        </div>
      </div>

      {/* Engine Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Algorithm Configuration
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Algorithm Type
              </label>
              <select
                value={engineConfig.algorithm}
                onChange={(e) => updateEngineConfig({...engineConfig, algorithm: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="hybrid">Hybrid (Recommended)</option>
                <option value="collaborative">Collaborative Filtering</option>
                <option value="content_based">Content-Based</option>
                <option value="trending">Trending-Based</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personalization Level
              </label>
              <select
                value={engineConfig.personalization_level}
                onChange={(e) => updateEngineConfig({...engineConfig, personalization_level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="high">High Personalization</option>
                <option value="medium">Medium Personalization</option>
                <option value="low">Low Personalization</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Interval (hours)
              </label>
              <input
                type="number"
                value={engineConfig.refresh_interval}
                onChange={(e) => updateEngineConfig({...engineConfig, refresh_interval: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="1"
                max="168"
              />
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Algorithm Weights
          </h4>
          
          <div className="space-y-4">
            {Object.entries(engineConfig.weights).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-700">{key.replace('_', ' ')}</span>
                  <span className="font-medium">{(value * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateEngineConfig({
                    ...engineConfig,
                    weights: { ...engineConfig.weights, [key]: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Recommendations */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Recent Recommendation Batches</h4>
        
        {recentRecommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>No recent recommendations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecommendations.map((rec, index) => (
              <div key={rec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      User {rec.user_id.slice(-6)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {rec.recommended_videos?.length || 0} recommendations
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{rec.recommendation_score || 0}% confidence</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(rec.last_updated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}