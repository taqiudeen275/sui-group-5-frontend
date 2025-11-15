
import React, { useState } from 'react';
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Modal from './components/common/Modal';
import CreateSuitForm from './components/CreateSuitForm';
import CreateProfile from './components/CreateProfile';
import { useProfile } from './src/hooks/useProfile';
import { useSuits } from './src/hooks/useSuits';
import { useLikes } from './src/hooks/useLikes';

const App: React.FC = () => {
  const account = useCurrentAccount();
  const { profile, isLoading: profileLoading } = useProfile();
  const { suits, createSuit, isLoading: suitsLoading } = useSuits();
  const { likeSuit, unlikeSuit, isLiked, getLikeId } = useLikes();
  const [isComposeModalOpen, setComposeModalOpen] = useState(false);
  
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
  if (profileLoading || suitsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile creation if no profile
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <CreateProfile />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
        <Sidebar currentUser={profile} onCompose={() => setComposeModalOpen(true)} />

        <main className="flex-1 border-r border-border">
          <Feed 
            suits={suits.map(suitWithStore => ({
              id: suitWithStore.suit.id,
              body: suitWithStore.suit.body,
              createdAt: suitWithStore.suit.createdAt,
              author: suitWithStore.author,
              comments: [],
              reposts: suitWithStore.store.repostCount || 0,
              likes: [],
              isRepost: suitWithStore.isRepost,
              originalAuthor: suitWithStore.originalAuthor,
              storeId: suitWithStore.store.id,
            }))}
            currentUser={profile}
            onCreateSuit={handleCreateSuit}
            onLikeSuit={(suitId) => {
              const suit = suits.find(s => s.suit.id === suitId);
              if (suit) {
                handleLikeSuit(suit.store.id);
              }
            }}
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

        <Modal isOpen={isComposeModalOpen} onClose={() => setComposeModalOpen(false)} title="Compose Suit">
            <CreateSuitForm currentUser={profile} onSubmit={handleCreateSuit} />
        </Modal>
    </div>
  );
};

export default App;
