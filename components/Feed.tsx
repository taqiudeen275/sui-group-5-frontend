
import React from 'react';
import type { Suit, Profile } from '../types';
import CreateSuitForm from './CreateSuitForm';
import SuitCard from './SuitCard';

interface FeedProps {
  suits: Suit[];
  currentUser: Profile;
  onCreateSuit: (body: string) => void;
  onLikeSuit: (suitId: string) => void;
}

const Feed: React.FC<FeedProps> = ({ suits, currentUser, onCreateSuit, onLikeSuit }) => {
  return (
    <div>
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 p-4 border-b border-border">
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <CreateSuitForm currentUser={currentUser} onSubmit={onCreateSuit} />
      <div>
        {suits.map(suit => (
          <SuitCard key={suit.id} suit={suit} currentUser={currentUser} onLike={onLikeSuit} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
