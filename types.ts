// ============================================================================
// Profile Types
// ============================================================================

export interface Profile {
  id: string;
  owner: string;
  username: string;
  bio: string;
  profileImageUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProfileData {
  id: { id: string };
  owner: string;
  username: string;
  bio: string;
  profile_image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileInput {
  username: string;
  bio: string;
  profileImageUrl: string;
}

// ============================================================================
// Suit Types
// ============================================================================

export interface Suit {
  id: string;
  body: string;
  createdAt: number;
}

export interface SuitData {
  id: { id: string };
  body: string;
  created_at: string;
}

export interface SuiStore {
  id: string;
  suit: string;
  comments: Map<string, boolean>;
  repost: Map<string, boolean>;
  likes: Map<string, string>;
  createdAt: number;
  likesCount?: number;
  commentsCount?: number;
  repostCount?: number;
}

export interface SuiStoreData {
  id: { id: string };
  suit: string;
  comments: { type: string; fields: { id: { id: string }; size: string } };
  repost: { type: string; fields: { id: { id: string }; size: string } };
  likes: { type: string; fields: { id: { id: string }; size: string } };
  created_at: string;
}

export interface SuitWithStore {
  suit: Suit;
  store: SuiStore;
  author: Profile;
  isRepost: boolean;
  originalAuthor?: Profile;
}

// ============================================================================
// Comment Types
// ============================================================================

export interface Comment {
  id: string;
  user: string | Profile;
  createdAt: number;
  content: string;
  author?: Profile;
}

// Extended Suit type for UI with store information
export interface SuitUI extends Suit {
  author: Profile;
  comments: Comment[];
  reposts: number;
  likes: string[];
  isRepost: boolean;
  originalAuthor?: Profile;
  storeId?: string;
}

export interface CommentData {
  id: { id: string };
  user: string;
  created_at: string;
  content: string;
}

// ============================================================================
// Like Types
// ============================================================================

export interface Like {
  id: string;
  user: string;
  createdAt: number;
}

export interface LikeData {
  id: { id: string };
  user: string;
  created_at: string;
}
