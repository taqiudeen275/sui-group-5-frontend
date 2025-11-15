# Suitter - Decentralized Social Platform on Sui

A Twitter-like decentralized social media platform built on the Sui blockchain using Move smart contracts.

## 🌟 Features

- **Decentralized Profiles**: Create and manage your profile on-chain
- **Suits (Posts)**: Share your thoughts with the community
- **Likes**: Show appreciation for great content
- **Comments**: Engage in conversations
- **Reposts**: Share content you love
- **Real-time Updates**: See new content as it's posted
- **Wallet Integration**: Connect with any Sui-compatible wallet

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Sui wallet browser extension
- Deployed Suitter smart contracts

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Update contract IDs (see SETUP.md)
# - SUITTER_PACKAGE_ID in src/lib/constants.ts
# - PROFILE_REGISTRY_ID in src/hooks/useProfile.ts

# Start development server
pnpm dev
```

Visit `http://localhost:5173` and connect your wallet!

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[INTEGRATION.md](./INTEGRATION.md)** - Technical integration details
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference for developers
- **[FIND_REGISTRY_ID.md](./FIND_REGISTRY_ID.md)** - How to find ProfileRegistry ID
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Integration overview

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19 + TypeScript
- **Blockchain**: Sui Network (Move smart contracts)
- **State Management**: React Query (TanStack Query)
- **Wallet**: Mysten dApp Kit
- **Build Tool**: Vite
- **Styling**: Custom CSS with Tailwind-like utilities

### Project Structure

```
suitter-frontend/
├── src/
│   ├── hooks/              # Blockchain interaction hooks
│   │   ├── useProfile.ts   # Profile management
│   │   ├── useSuits.ts     # Suit/post management
│   │   ├── useLikes.ts     # Like management
│   │   └── useComments.ts  # Comment management
│   ├── lib/                # Utilities and constants
│   │   ├── constants.ts    # Contract IDs and config
│   │   ├── sui-client.ts   # Sui client utilities
│   │   └── error-utils.ts  # Error handling
│   └── networkConfig.ts    # Network configuration
├── components/             # React components
│   ├── common/            # Reusable UI components
│   ├── CreateProfile.tsx  # Profile creation form
│   ├── Feed.tsx           # Main feed
│   ├── Sidebar.tsx        # Navigation
│   └── SuitCard.tsx       # Post card
├── types.ts               # TypeScript definitions
├── App.tsx                # Main app component
└── index.tsx              # Entry point with providers
```

## 🔧 Configuration

### Required Configuration

1. **Package ID**: Update in `src/lib/constants.ts`
   ```typescript
   export const SUITTER_PACKAGE_ID = "0xYOUR_PACKAGE_ID";
   ```

2. **Profile Registry ID**: Update in `src/hooks/useProfile.ts`
   ```typescript
   const PROFILE_REGISTRY_ID = "0xYOUR_REGISTRY_ID";
   ```

3. **Network**: Set in `index.tsx` (testnet/devnet/mainnet)

See [SETUP.md](./SETUP.md) for detailed instructions.

## 🎯 Usage

### Connect Wallet
1. Click "Connect Wallet"
2. Select your Sui wallet
3. Approve the connection

### Create Profile
1. Enter username and bio
2. Optionally add profile image URL
3. Approve the transaction

### Create a Suit (Post)
1. Type your message (max 280 characters)
2. Click "Post"
3. Approve the transaction

### Interact with Suits
- **Like**: Click the heart icon
- **Comment**: Click the comment icon (coming soon)
- **Repost**: Click the repost icon (coming soon)

## 🧪 Testing

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Get Testnet SUI
Visit the [Sui Discord](https://discord.gg/sui) and use the faucet in the #testnet-faucet channel.

## 📦 Smart Contract Integration

This frontend integrates with the following Move modules:

- **profile**: User profile management
- **suitter**: Suit creation and interactions
- **like**: Like functionality
- **comment**: Comment system

See [INTEGRATION.md](./INTEGRATION.md) for technical details.

## 🔐 Security

- No private keys stored in frontend
- All transactions require wallet approval
- Input validation on all forms
- User-friendly error messages
- Secure communication with Sui network

## 🚢 Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete deployment guide.

### Quick Deploy

```bash
# Build
pnpm build

# Deploy to Vercel
vercel deploy

# Or deploy to Netlify
netlify deploy
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check [SETUP.md](./SETUP.md) for setup issues
- Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for API usage
- Visit [Sui Discord](https://discord.gg/sui) for community support
- Check [Sui Documentation](https://docs.sui.io/) for blockchain questions

## 🔗 Links

- [Sui Network](https://sui.io/)
- [Sui Documentation](https://docs.sui.io/)
- [Mysten dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Sui Explorer](https://suiexplorer.com/)

## ✨ Features Coming Soon

- Comment display and creation UI
- Repost UI
- User profile pages
- Search functionality
- Notifications
- Direct messages
- Follow/unfollow system

---

Built with ❤️ on Sui
