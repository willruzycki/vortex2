import React from 'react';
import { ThumbsUp, Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const Comment = ({ comment }) => (
  <div className="flex items-start gap-4">
    <Link to={createPageUrl(`UserProfile?username=${comment.commenter_username}`)}>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex-shrink-0">
          {comment.commenter_avatar_url ? (
            <img src={comment.commenter_avatar_url} alt={comment.commenter_full_name} className="w-full h-full object-cover rounded-full"/>
          ) : (
            <span className="text-lg font-bold text-white flex items-center justify-center w-full h-full">{comment.commenter_full_name?.charAt(0).toUpperCase() || 'U'}</span>
          )}
        </div>
    </Link>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <Link to={createPageUrl(`UserProfile?username=${comment.commenter_username}`)}>
            <h4 className="font-semibold text-sm text-gray-300 hover:text-white">{comment.commenter_full_name}</h4>
        </Link>
        <p className="text-gray-400 text-xs">{formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}</p>
      </div>
      <p className="text-gray-200">{comment.content}</p>
      <div className="flex items-center gap-4 mt-2 text-gray-400">
        <button className="flex items-center gap-1 hover:text-white transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span className="text-xs">{comment.likes || 0}</span>
        </button>
      </div>
    </div>
  </div>
);

export default function CommentSection({ comments, newComment, setNewComment, onCommentSubmit, isCommenting, user }) {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-6">{comments.length} Comments</h2>

      {user ? (
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
               <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-full"/>
            ) : (
              <UserIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b-2 border-gray-600 focus:border-red-500 outline-none transition-colors text-white resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={onCommentSubmit} disabled={isCommenting || !newComment.trim()} className="bg-red-600 hover:bg-red-700">
                {isCommenting ? 'Commenting...' : 'Comment'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 my-8 p-4 bg-gray-800/50 rounded-lg">
          You need to be signed in to comment.
        </div>
      )}


      <div className="space-y-6">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}