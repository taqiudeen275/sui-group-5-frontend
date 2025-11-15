# Suitter Integration - Quick Reference

## 🚀 Quick Start

```bash
pnpm install
# Update SUITTER_PACKAGE_ID in src/lib/constants.ts
# Update PROFILE_REGISTRY_ID in src/hooks/useProfile.ts
pnpm dev
```

## 📦 Key Files

| File | Purpose |
|------|---------|
| `src/lib/constants.ts` | Contract IDs and configuration |
| `src/hooks/useProfile.ts` | Profile operations |
| `src/hooks/useSuits.ts` | Suit/post operations |
| `src/hooks/useLikes.ts` | Like operations |
| `src/hooks/useComments.ts` | Comment operations |

## 🔧 Configuration

### Update Package ID
```typescript
// src/lib/constants.ts
export const SUITTER_PACKAGE_ID = "0xYOUR_PACKAGE_ID";
```

### Update Registry ID
```typescript
// src/hooks/useProfile.ts
const PROFILE_REGISTRY_ID = "0xYOUR_REGISTRY_ID";
```

## 🎣 Using Hooks

### Profile Hook
```typescript
import { useProfile } from './src/hooks/useProfile';

const { profile, createProfile, updateBio, isLoading } = useProfile();

// Create profile
await createProfile({
  username: "alice",
  bio: "Hello Sui!",
  profileImageUrl: "https://..."
});

// Update bio
await updateBio("New bio");
```

### Suits Hook
```typescript
import { useSuits } from './src/hooks/useSuits';

const { suits, createSuit, repostSuit, isLoading } = useSuits();

// Create suit
await createSuit("Hello Suitter!");

// Repost
await repostSuit(suitId, storeId);
```

### Likes Hook
```typescript
import { useLikes } from './src/hooks/useLikes';

const { likeSuit, unlikeSuit, isLiked, getLikeCount } = useLikes();

// Like a suit
await likeSuit(storeId);

// Unlike
await unlikeSuit(storeId, likeId);

// Check if liked
const liked = isLiked(storeId);

// Get count
const count = getLikeCount(storeId);
```

### Comments Hook
```typescript
import { useComments } from './src/hooks/useComments';

const { comments, addComment, getCommentCount } = useComments(suitId);

// Add comment
await addComment(storeId, "Great post!");

// Get count
const count = getCommentCount(storeId);
```

## 🔐 Wallet Integration

```typescript
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";

const account = useCurrentAccount();

// Show connect button
<ConnectButton />

// Check if connected
if (account) {
  console.log("Connected:", account.address);
}
```

## 📝 Smart Contract Functions

### Profile Module
```move
entry fun create_and_keep_profile(
  registry: &mut ProfileRegistry,
  username: String,
  bio: String,
  profile_image_url: String,
  ctx: &mut TxContext
)

entry fun update_profile_bio(
  profile: &mut Profile,
  new_bio: String,
  ctx: &TxContext
)

entry fun update_profile_image_url(
  profile: &mut Profile,
  new_image_url: String,
  ctx: &TxContext
)
```

### Suitter Module
```move
entry fun create_and_keep_suit(
  body: String,
  ctx: &mut TxContext
)

entry fun create_and_keep_like(
  suit_store: &mut SuiStore,
  ctx: &mut TxContext
)

entry fun unlike_suit(
  suit_store: &mut SuiStore,
  ctx: &mut TxContext
)

entry fun create_and_keep_comment(
  text: String,
  suit_store: &mut SuiStore,
  ctx: &mut TxContext
)

entry fun repost_and_keep_suit(
  original_suit: &Suit,
  original_suit_store: &mut SuiStore,
  ctx: &mut TxContext
)
```

## 🏗️ Data Structures

### Profile
```typescript
interface Profile {
  id: string;
  owner: string;
  username: string;
  bio: string;
  profileImageUrl: string;
  createdAt: number;
  updatedAt: number;
}
```

### Suit
```typescript
interface Suit {
  id: string;
  body: string;
  createdAt: number;
}
```

### SuiStore
```typescript
interface SuiStore {
  id: string;
  suit: string;
  likesCount?: number;
  commentsCount?: number;
  repostCount?: number;
}
```

### SuitWithStore
```typescript
interface SuitWithStore {
  suit: Suit;
  store: SuiStore;
  author: Profile;
  isRepost: boolean;
  originalAuthor?: Profile;
}
```

## 🐛 Common Errors

| Error | Solution |
|-------|----------|
| "Wallet not connected" | Click Connect Wallet button |
| "Insufficient gas" | Add SUI to wallet from faucet |
| "Profile already exists" | User already has a profile |
| "Username already taken" | Choose different username |
| "Object not found" | Check package/registry IDs |

## 🌐 Network URLs

```typescript
// Testnet
https://fullnode.testnet.sui.io:443

// Devnet
https://fullnode.devnet.sui.io:443

// Mainnet
https://fullnode.mainnet.sui.io:443
```

## 🔍 Finding Object IDs

### Package ID
```bash
# From deployment output
sui client publish

# Or query
sui client objects | grep "Package"
```

### Registry ID
```bash
sui client objects --filter StructType \
  --type "<PACKAGE_ID>::profile::ProfileRegistry"
```

## 📊 React Query Configuration

```typescript
// Stale time: 5 minutes
// Cache time: 10 minutes
// Refetch interval: 10 seconds (suits only)

// Manual refetch
const { refetch } = useSuits();
refetch();

// Invalidate cache
queryClient.invalidateQueries({ queryKey: ["suits"] });
```

## 🎨 UI Components

### Connect Wallet
```tsx
import { ConnectButton } from "@mysten/dapp-kit";
<ConnectButton />
```

### Create Profile
```tsx
import CreateProfile from './components/CreateProfile';
<CreateProfile />
```

### Feed
```tsx
import Feed from './components/Feed';
<Feed 
  suits={suits}
  currentUser={profile}
  onCreateSuit={handleCreateSuit}
  onLikeSuit={handleLikeSuit}
/>
```

## 🧪 Testing

```bash
# Get testnet SUI
# Visit: https://discord.com/channels/916379725201563759/971488439931392130

# Check balance
sui client gas

# View objects
sui client objects

# View specific object
sui client object <OBJECT_ID>
```

## 📚 Resources

- [Sui Docs](https://docs.sui.io/)
- [dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Move Book](https://move-book.com/)
- [Sui Explorer](https://suiexplorer.com/)
