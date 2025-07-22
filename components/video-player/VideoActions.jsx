import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserReaction, Video } from '@/api/entities';

export default function VideoActions({ video, user, onVideoUpdate }) {
    const [reaction, setReaction] = useState(null); // 'like', 'dislike', or null
    const [likes, setLikes] = useState(video.likes || 0);
    const [dislikes, setDislikes] = useState(video.dislikes || 0);

    useEffect(() => {
        const fetchReaction = async () => {
            if (user && video) {
                const userReactions = await UserReaction.filter({ user_id: user.id, video_id: video.id });
                if (userReactions.length > 0) {
                    setReaction(userReactions[0].reaction);
                }
            }
        };
        fetchReaction();
    }, [user, video]);

    const handleReaction = async (newReaction) => {
        if (!user) {
            alert('Please log in to react to videos.');
            return;
        }

        const oldReaction = reaction;
        
        // Optimistic UI update
        setReaction(newReaction === oldReaction ? null : newReaction);
        if (oldReaction === 'like') setLikes(l => l - 1);
        if (oldReaction === 'dislike') setDislikes(d => d - 1);
        if (newReaction !== oldReaction) {
            if (newReaction === 'like') setLikes(l => l + 1);
            if (newReaction === 'dislike') setDislikes(d => d + 1);
        }

        try {
            // Find existing reaction to update or delete
            const existing = await UserReaction.filter({ user_id: user.id, video_id: video.id });

            if (newReaction === oldReaction) { // Undoing a reaction
                if (existing.length > 0) await UserReaction.delete(existing[0].id);
            } else { // Setting a new reaction
                if (existing.length > 0) {
                    await UserReaction.update(existing[0].id, { reaction: newReaction });
                } else {
                    await UserReaction.create({ user_id: user.id, video_id: video.id, reaction: newReaction });
                }
            }
            
            // Sync with DB
            const updatedVideo = await Video.update(video.id, {
                likes: oldReaction === 'like' && newReaction !== 'like' ? likes - 1 : newReaction === 'like' ? likes + 1 : likes,
                dislikes: oldReaction === 'dislike' && newReaction !== 'dislike' ? dislikes - 1 : newReaction === 'dislike' ? dislikes + 1 : dislikes,
            });
            onVideoUpdate({ likes: updatedVideo.likes, dislikes: updatedVideo.dislikes });

        } catch (error) {
            console.error('Failed to update reaction:', error);
            // Revert UI on failure
            setReaction(oldReaction);
            setLikes(video.likes);
            setDislikes(video.dislikes);
            alert('Could not save your reaction. Please try again.');
        }
    };
    
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="flex items-center gap-2 my-4">
            <div className="flex items-center bg-gray-800 rounded-full">
                <Button 
                    variant="ghost" 
                    className={`rounded-l-full hover:bg-gray-700 ${reaction === 'like' ? 'text-red-500' : 'text-white'}`}
                    onClick={() => handleReaction('like')}
                >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    {likes.toLocaleString()}
                </Button>
                <div className="w-px h-6 bg-gray-600" />
                <Button 
                    variant="ghost" 
                    className={`rounded-r-full hover:bg-gray-700 ${reaction === 'dislike' ? 'text-red-500' : 'text-white'}`}
                    onClick={() => handleReaction('dislike')}
                >
                    <ThumbsDown className="w-5 h-5" />
                </Button>
            </div>
            <Button variant="ghost" className="bg-gray-800 hover:bg-gray-700 rounded-full" onClick={handleShare}>
                <Share2 className="w-5 h-5 mr-2" />
                Share
            </Button>
            <Button variant="ghost" className="bg-gray-800 hover:bg-gray-700 rounded-full">
                <PlusSquare className="w-5 h-5 mr-2" />
                Save
            </Button>
        </div>
    );
}