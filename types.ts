
export interface Profile {
  id: string;
  owner: string; // address
  username: string;
  bio: string;
  profileImageUrl: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  user: Profile;
  createdAt: number;
  content: string;
}

export interface Suit {
  id: string;
  body: string;
  createdAt: number;
  author: Profile;
  comments: Comment[];
  reposts: number;
  likes: string[]; // array of profile IDs
  isRepost: boolean;
  originalAuthor?: Profile;
}
