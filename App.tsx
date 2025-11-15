
import React, { useState } from 'react';
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Modal from './components/common/Modal';
import CreateSuitForm from './components/CreateSuitForm';
import CreateProfile from './components/CreateProfile';
import CommentModal from './components/CommentModal';
import { useProfile } from './src/hooks/useProfile';
import { useSuits } from './src/hooks/useSuits';
import { useLikes } from './src/hooks/useLikes';
import { useComments } from './src/hooks/useComments';
import type { SuitUI } from './types';

const App: React.FC = () => {
  const account = useCurrentAccount();
  const { profile } = useProfile();
  const { suits, createSuit, repostSuit, isLoading: suitsLoading } = useSuits();
  const { likeSuit, unlikeSuit, isLiked, getLikeId, getLikeCount } = useLikes();
  const { addComment, getCommentCount } = useComments();
  const [isComposeModalOpen, setComposeModalOpen] = useState(false);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [commentingSuit, setCommentingSuit] = useState<SuitUI | null>(null);
  
  const handleCreateSuit = async (body: string) => {
    try {
      await createSuit(body);
      setComposeModalOpen(false);
    } catch (error) {
      console.error("Error creating suit:", error);
      alert(error instanceof Error ? error.message : "Failed to create suit");
    }
  };

  const handleLikeSuit = async (storeId: string) => {
    try {
      if (isLiked(storeId)) {
        const likeId = getLikeId(storeId);
        if (likeId) {
          await unlikeSuit(storeId, likeId);
        }
      } else {
        await likeSuit(storeId);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert(error instanceof Error ? error.message : "Failed to toggle like");
    }
  };

  const handleComment = (suitId: string) => {
    const suit = suits.find(s => s.suit.id === suitId);
    if (suit) {
      const suitUI: SuitUI = {
        id: suit.suit.id,
        body: suit.suit.body,
        createdAt: suit.suit.createdAt,
        author: suit.author,
        comments: [],
        reposts: suit.store.repostCount || 0,
        likes: [],
        isRepost: suit.isRepost,
        originalAuthor: suit.originalAuthor,
        storeId: suit.store.id,
      };
      setCommentingSuit(suitUI);
    }
  };

  const handleAddComment = async (storeId: string, text: string) => {
    try {
      await addComment(storeId, text);
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const handleRepost = async (suitId: string) => {
    try {
      const suit = suits.find(s => s.suit.id === suitId);
      if (!suit) return;

      const confirmed = window.confirm('Repost this suit?');
      if (!confirmed) return;

      await repostSuit(suitId, suit.store.id);
      alert('Suit reposted successfully!');
    } catch (error) {
      console.error("Error reposting:", error);
      alert(error instanceof Error ? error.message : "Failed to repost");
    }
  };

  // Show wallet connection if not connected
  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Suitter</h1>
          <p className="text-lg mb-8">Connect your wallet to get started</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // Show loading state
  if (suitsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Create a default user object if no profile exists
  const currentUser = profile || {
    id: account.address,
    owner: account.address,
    username: `User ${account.address.slice(0, 6)}`,
    bio: '',
    profileImageUrl: 'https://picsum.photos/200',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
        {/* Show profile creation banner if no profile */}
        {!profile && (
          <div className="fixed top-0 left-0 right-0 bg-primary text-white p-3 text-center z-50">
            <p className="inline-block mr-4">
              Create your profile to get the full Suitter experience!
            </p>
            <button
              onClick={() => setShowProfileCreation(true)}
              className="bg-white text-primary px-4 py-1 rounded-full font-bold hover:bg-gray-100"
            >
              Create Profile
            </button>
          </div>
        )}

        <Sidebar currentUser={currentUser} onCompose={() => setComposeModalOpen(true)} />

        <main className="flex-1 border-r border-border">
          <Feed 
            suits={suits.map(suitWithStore => {
              const storeId = suitWithStore.store.id;
              const likeData = getLikeCount(storeId);
              const commentCount = getCommentCount(storeId);
              const liked = isLiked(storeId);
              
              return {
                id: suitWithStore.suit.id,
                body: suitWithStore.suit.body,
                createdAt: suitWithStore.suit.createdAt,
                author: suitWithStore.author,
                comments: Array(commentCount).fill(null), // Placeholder array for count
                reposts: suitWithStore.store.repostCount || 0,
                likes: liked ? [currentUser.id] : [], // Show as liked if user has liked
                likesCount: likeData,
                isRepost: suitWithStore.isRepost,
                originalAuthor: suitWithStore.originalAuthor,
                storeId: storeId,
              };
            })}
            currentUser={currentUser}
            onCreateSuit={handleCreateSuit}
            onLikeSuit={(suitId) => {
              const suit = suits.find(s => s.suit.id === suitId);
              if (suit) {
                handleLikeSuit(suit.store.id);
              }
            }}
            onComment={handleComment}
            onRepost={handleRepost}
          />
        </main>
        
        <aside className="w-96 hidden lg:block p-4">
          <div className="bg-surface rounded-2xl p-4">
              <h2 className="text-xl font-bold mb-4">What's happening</h2>
              <div className="space-y-4">
                  <div>
                      <p className="text-on-surface-secondary text-sm">Blockchain · Trending</p>
                      <p className="font-bold">#SuiNetwork</p>
                      <p className="text-on-surface-secondary text-sm">{suits.length} Suits</p>
                  </div>
                   <div>
                      <p className="text-on-surface-secondary text-sm">Connected</p>
                      <p className="font-bold">{account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
                      <ConnectButton />
                  </div>
              </div>
          </div>
        </aside>

        {/* Profile Creation Modal */}
        <Modal isOpen={showProfileCreation} onClose={() => setShowProfileCreation(false)} title="Create Profile">
          <CreateProfile />
        </Modal>

        {/* Compose Suit Modal */}
        <Modal isOpen={isComposeModalOpen} onClose={() => setComposeModalOpen(false)} title="Compose Suit">
          <CreateSuitForm currentUser={currentUser} onSubmit={handleCreateSuit} />
        </Modal>

        {/* Comment Modal */}
        {commentingSuit && (
          <Modal isOpen={true} onClose={() => setCommentingSuit(null)} title="Reply">
            <CommentModal 
              suit={commentingSuit}
              currentUser={currentUser}
              onSubmit={handleAddComment}
              onClose={() => setCommentingSuit(null)}
            />
          </Modal>
        )}
    </div>
  );
};

export default App;
