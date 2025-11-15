import React, { useState } from 'react';
import type { SuitUI, Profile } from '../types';

interface CommentModalProps {
  suit: SuitUI;
  currentUser: Profile;
  onSubmit: (storeId: string, text: string) => Promise<void>;
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ suit, currentUser, onSubmit, onClose }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !suit.storeId) return;

    setIsSubmitting(true);
    try {
      await onSubmit(suit.storeId, comment);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl">
      {/* Original Suit */}
      <div className="flex space-x-3 mb-4 pb-4 border-b border-border">
        <img 
          src={suit.author.profileImageUrl} 
          alt={suit.author.username} 
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold">{suit.author.username}</span>
            <span className="text-on-surface-secondary text-sm">
              @{suit.author.username.toLowerCase()}
            </span>
          </div>
          <p className="text-on-surface mt-1">{suit.body}</p>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <img 
            src={currentUser.profileImageUrl} 
            alt={currentUser.username} 
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Post your reply"
              className="w-full bg-transparent text-on-surface text-lg outline-none resize-none min-h-[100px]"
              maxLength={280}
              disabled={isSubmitting}
              autoFocus
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-on-surface-secondary">
                {comment.length}/280
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full font-bold text-on-surface hover:bg-white/10 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!comment.trim() || isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-full font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Replying...' : 'Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentModal;
