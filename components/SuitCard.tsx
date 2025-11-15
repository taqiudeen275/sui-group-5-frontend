
import React from 'react';
import { MessageCircle, Repeat2, Heart } from 'lucide-react';
import type { SuitUI, Profile } from '../types';

interface SuitCardProps {
  suit: SuitUI;
  currentUser: Profile;
  onLike: (suitId: string) => void;
  onComment?: (suitId: string) => void;
  onRepost?: (suitId: string) => void;
}

const SuitCard: React.FC<SuitCardProps> = ({ suit, currentUser, onLike, onComment, onRepost }) => {
    const { author, createdAt, body, likes, reposts, comments, isRepost, originalAuthor } = suit;
    const isLiked = likes.includes(currentUser.id);

    const timeAgo = (date: number) => {
        const seconds = Math.floor((new Date().getTime() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    return (
        <div className="flex space-x-4 p-4 border-b border-border hover:bg-white/5 transition-colors duration-200">
            <img src={author.profileImageUrl} alt={`${author.username}'s avatar`} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
                {isRepost && originalAuthor && (
                    <div className="text-sm text-on-surface-secondary mb-1 flex items-center space-x-2">
                        <Repeat2 className="w-4 h-4" />
                        <span>{author.username} reposted</span>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-on-surface">{isRepost ? originalAuthor?.username : author.username}</span>
                    <span className="text-on-surface-secondary">@{isRepost ? originalAuthor?.username.toLowerCase() : author.username.toLowerCase()}</span>
                    <span className="text-on-surface-secondary">·</span>
                    <span className="text-on-surface-secondary">{timeAgo(createdAt)}</span>
                </div>
                <p className="text-on-surface mt-1 whitespace-pre-wrap">{body}</p>
                <div className="flex justify-between mt-4 max-w-sm text-on-surface-secondary">
                    <button 
                        onClick={() => onComment?.(suit.id)} 
                        className="flex items-center space-x-2 group focus:outline-none"
                    >
                        <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                            <MessageCircle className="w-5 h-5 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm">{comments.length}</span>
                    </button>
                    <button 
                        onClick={() => onRepost?.(suit.id)} 
                        className="flex items-center space-x-2 group focus:outline-none"
                    >
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                           <Repeat2 className="w-5 h-5 group-hover:text-green-500 transition-colors" />
                        </div>
                        <span className="text-sm">{reposts}</span>
                    </button>
                    <button onClick={() => onLike(suit.id)} className="flex items-center space-x-2 group focus:outline-none">
                        <div className={`p-2 rounded-full group-hover:bg-pink-500/10 transition-colors ${isLiked ? 'bg-pink-500/10' : ''}`}>
                            {isLiked ? (
                                <Heart className="w-5 h-5 text-pink-500 fill-pink-500 transition-colors" />
                            ) : (
                                <Heart className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
                            )}
                        </div>
                        <span className={`text-sm transition-colors ${isLiked ? 'text-pink-500' : ''}`}>{likes.length}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuitCard;
