
import React, { useState, useCallback } from 'react';
import type { Suit, Profile, Comment } from './types';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Modal from './components/common/Modal';
import CreateSuitForm from './components/CreateSuitForm';

// --- MOCK DATA ---
const user1: Profile = {
  id: 'user_1',
  owner: '0x123',
  username: 'SuiMaster',
  bio: 'Building the future on Sui.',
  profileImageUrl: 'https://picsum.photos/seed/user1/200',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
};

const user2: Profile = {
  id: 'user_2',
  owner: '0x456',
  username: 'MoveDev',
  bio: 'Just writing some Move code.',
  profileImageUrl: 'https://picsum.photos/seed/user2/200',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
};

const initialSuits: Suit[] = [
  {
    id: 'suit_1',
    author: user2,
    body: "Just deployed my first smart contract on Sui! The experience was incredibly smooth. The developer tooling is top-notch. #Sui #MoveLang",
    createdAt: Date.now() - 1000 * 60 * 2,
    comments: [],
    reposts: 5,
    likes: ['user_1'],
    isRepost: false,
  },
  {
    id: 'suit_2',
    author: user1,
    body: "Exploring the Sui ecosystem is fascinating. So many innovative projects being built. The scalability is a game changer for dApps.",
    createdAt: Date.now() - 1000 * 60 * 60,
    comments: [
        { id: 'comment_1', user: user2, content: "Totally agree! The object-centric model is powerful.", createdAt: Date.now() - 1000 * 60 * 30 }
    ],
    reposts: 12,
    likes: ['user_2'],
    isRepost: false,
  },
  {
    id: 'suit_3',
    author: user1,
    originalAuthor: user2,
    body: "Just deployed my first smart contract on Sui! The experience was incredibly smooth. The developer tooling is top-notch. #Sui #MoveLang",
    createdAt: Date.now() - 1000 * 60 * 10,
    comments: [],
    reposts: 0,
    likes: [],
    isRepost: true,
  }
];
// --- END MOCK DATA ---

const App: React.FC = () => {
  const [suits, setSuits] = useState<Suit[]>(initialSuits);
  const [currentUser] = useState<Profile>(user1);
  const [isComposeModalOpen, setComposeModalOpen] = useState(false);
  
  // This would be a call to the Sui smart contract
  const handleCreateSuit = (body: string) => {
    console.log("Creating suit:", body);
    const newSuit: Suit = {
      id: `suit_${Date.now()}`,
      author: currentUser,
      body,
      createdAt: Date.now(),
      comments: [],
      reposts: 0,
      likes: [],
      isRepost: false,
    };
    setSuits(prevSuits => [newSuit, ...prevSuits]);
    setComposeModalOpen(false);
  };

  const handleLikeSuit = useCallback((suitId: string) => {
    // This would be a call to the Sui smart contract
    console.log(`Liking/Unliking suit: ${suitId}`);
    setSuits(prevSuits => 
      prevSuits.map(suit => {
        if (suit.id === suitId) {
          const isLiked = suit.likes.includes(currentUser.id);
          const newLikes = isLiked
            ? suit.likes.filter(id => id !== currentUser.id)
            : [...suit.likes, currentUser.id];
          return { ...suit, likes: newLikes };
        }
        return suit;
      })
    );
  }, [currentUser.id]);

  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
        <Sidebar currentUser={currentUser} onCompose={() => setComposeModalOpen(true)} />

        <main className="flex-1 border-r border-border">
          <Feed 
            suits={suits} 
            currentUser={currentUser}
            onCreateSuit={handleCreateSuit}
            onLikeSuit={handleLikeSuit}
          />
        </main>
        
        <aside className="w-96 hidden lg:block p-4">
          <div className="bg-surface rounded-2xl p-4">
              <h2 className="text-xl font-bold mb-4">What's happening</h2>
              {/* Placeholder for trends */}
              <div className="space-y-4">
                  <div>
                      <p className="text-on-surface-secondary text-sm">Blockchain · Trending</p>
                      <p className="font-bold">#SuiNetwork</p>
                      <p className="text-on-surface-secondary text-sm">1,234 Suits</p>
                  </div>
                   <div>
                      <p className="text-on-surface-secondary text-sm">Gaming · Trending</p>
                      <p className="font-bold">#Web3Gaming</p>
                      <p className="text-on-surface-secondary text-sm">987 Suits</p>
                  </div>
              </div>
          </div>
        </aside>

        <Modal isOpen={isComposeModalOpen} onClose={() => setComposeModalOpen(false)} title="Compose Suit">
            <CreateSuitForm currentUser={currentUser} onSubmit={handleCreateSuit} />
        </Modal>
    </div>
  );
};

export default App;
