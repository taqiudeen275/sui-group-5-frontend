# Suitter Smart Contract Integration

This document describes how the Suitter frontend is integrated with the Sui blockchain smart contracts.

## Overview

The frontend uses the Mysten Sui SDK (`@mysten/dapp-kit` and `@mysten/sui`) to interact with the smart contracts deployed on the Sui blockchain.

## Architecture

### Providers Setup (index.tsx)

The app is wrapped with the following providers:
- `QueryClientProvider` - React Query for data fetching and caching
- `SuiClientProvider` - Sui client for blockchain interactions
- `WalletProvider` - Wallet connection management

### Configuration

#### Network Configuration (`src/networkConfig.ts`)
Configures the Sui networks (devnet, testnet, mainnet) that the app can connect to.

#### Constants (`src/lib/constants.ts`)
Contains:
- `SUITTER_PACKAGE_ID` - The deployed contract package ID (update this after deployment)
- Module names (suitter, profile, comment, like)
- Struct types for querying objects
- Entry function names for transactions
- UI constants

### Custom Hooks

#### useProfile (`src/hooks/useProfile.ts`)
Manages user profile operations:
- **Query**: Fetches the user's profile from the blockchain
- **Mutations**:
  - `createProfile(data)` - Creates a new profile
  - `updateBio(bio)` - Updates profile bio
  - `updateProfileImage(url)` - Updates profile image

#### useSuits (`src/hooks/useSuits.ts`)
Manages suit (post) operations:
- **Query**: Fetches all suits with their stores and authors
- **Mutations**:
  - `createSuit(body)` - Creates a new suit
  - `repostSuit(suitId, storeId)` - Reposts an existing suit
- **Features**: Auto-refetches every 10 seconds for real-time updates

#### useLikes (`src/hooks/useLikes.ts`)
Manages like operations:
- **Mutations**:
  - `likeSuit(storeId)` - Likes a suit
  - `unlikeSuit(storeId, likeId)` - Unlikes a suit
- **Helpers**:
  - `isLiked(storeId)` - Checks if user has liked a suit
  - `getLikeCount(storeId)` - Gets the like count for a suit

#### useComments (`src/hooks/useComments.ts`)
Manages comment operations:
- **Query**: Fetches comments for a specific suit
- **Mutations**:
  - `addComment(storeId, text)` - Adds a comment to a suit
- **Helpers**:
  - `getCommentCount(storeId)` - Gets the comment count for a suit

### Utility Functions

#### Sui Client Utils (`src/lib/sui-client.ts`)
- `parseObjectContent<T>` - Parses blockchain object content
- `extractObjectId` - Extracts object ID from various formats
- `parseTimestamp` - Converts timestamp strings to numbers

#### Error Utils (`src/lib/error-utils.ts`)
- `parseTransactionError` - Converts blockchain errors to user-friendly messages

## Data Flow

1. **User connects wallet** → WalletProvider manages connection
2. **Profile check** → useProfile queries for user's profile
3. **Load suits** → useSuits queries all suits, stores, and profiles
4. **User interactions** → Mutations trigger blockchain transactions
5. **Auto-refresh** → React Query invalidates and refetches data after mutations

## Smart Contract Interaction

### Creating a Suit
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${SUITTER_PACKAGE_ID}::suitter::create_and_keep_suit`,
  arguments: [tx.pure.string(body)],
});
await signAndExecuteTransaction({ transaction: tx });
```

### Liking a Suit
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${SUITTER_PACKAGE_ID}::suitter::create_and_keep_like`,
  arguments: [tx.object(storeId)],
});
await signAndExecuteTransaction({ transaction: tx });
```

### Creating a Profile
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${SUITTER_PACKAGE_ID}::profile::create_and_keep_profile`,
  arguments: [
    tx.pure.string(username),
    tx.pure.string(bio),
    tx.pure.string(profileImageUrl),
  ],
});
await signAndExecuteTransaction({ transaction: tx });
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Update contract package ID**:
   - Deploy your contracts to Sui
   - Copy the package ID
   - Update `SUITTER_PACKAGE_ID` in `src/lib/constants.ts`

3. **Configure network**:
   - The app defaults to testnet
   - Change in `index.tsx` if needed

4. **Run the app**:
   ```bash
   pnpm dev
   ```

## Environment Variables

Create a `.env.local` file:
```
VITE_SUI_NETWORK=testnet
```

## Type Safety

All blockchain data structures are typed in `types.ts`:
- `Profile` - User profile
- `Suit` - Post/tweet
- `SuiStore` - Metadata store for suits
- `Comment` - Comment on a suit
- `Like` - Like on a suit
- `SuitWithStore` - Combined suit with store and author
- `SuitUI` - Extended suit type for UI rendering

## Error Handling

All mutations include error handling that:
1. Catches blockchain errors
2. Parses them into user-friendly messages
3. Displays them to the user via alerts (can be replaced with toast notifications)

## Caching Strategy

React Query configuration:
- **Stale time**: 5 minutes
- **Cache time**: 10 minutes
- **Refetch interval**: 10 seconds (for suits)
- **Auto-invalidation**: After mutations

## Next Steps

1. Add profile creation UI
2. Implement comment display and creation
3. Add repost functionality
4. Implement search and filtering
5. Add notifications for interactions
6. Optimize queries with indexer service
