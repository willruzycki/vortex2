import React, { useState, useEffect } from "react";
import { Comment, VideoInteraction } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Heart, Reply, MoreVertical, Send, UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CommentsSection({ videoId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoId) {
      loadComments();
    } else {
      setIsLoading(false);
    }
  }, [videoId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await Comment.filter({ video_id: videoId }, "-created_date");
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
    setIsLoading(false);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) { alert("Please log in to comment."); return; }
    if (!newComment.trim()) return;
    if (!videoId) { alert("Cannot comment on an unknown video."); return; }
    
    setIsSubmitting(true);
    try {
      const createdComment = await Comment.create({
        video_id: videoId,
        user_id: user.id,
        content: newComment,
        commenter_username: user.username || user.email.split('@')[0],
        commenter_full_name: user.full_name,
        commenter_avatar_url: user.avatar_url,
      });
      setComments([createdComment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to post comment.");
    }
    setIsSubmitting(false);
  };

  const CommentItem = ({ comment }) => (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0">
        {comment.commenter_avatar_url ? (
            <img src={comment.commenter_avatar_url} alt={comment.commenter_full_name} className="w-full h-full object-cover rounded-full" />
        ) : <UserCircle className="w-10 h-10 text-gray-500" />}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-300">{comment.commenter_full_name}</span>
          <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created_date))} ago</span>
        </div>
        <p className="text-white mt-1">{comment.content}</p>
        <div className="flex items-center gap-4 text-gray-400 mt-2">
            <button className="flex items-center gap-1 text-xs hover:text-white"><Heart size={14} /> {comment.likes || 0}</button>
            <button className="flex items-center gap-1 text-xs hover:text-white"><Reply size={14} /> Reply</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold text-white mb-4">{comments.length} Comments</h2>
      
      {/* New Comment Form */}
      {user && (
        <form onSubmit={submitComment} className="flex gap-4 mb-6">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0">
            {user.avatar_url ? <img src={user.avatar_url} alt="You" className="w-full h-full object-cover rounded-full" /> : <UserCircle className="w-10 h-10 text-gray-500" />}
          </div>
          <Textarea 
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-transparent border-b border-gray-600 focus:border-white text-white resize-none"
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-gray-400">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
        ) : (
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}