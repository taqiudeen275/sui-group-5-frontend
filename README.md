# Suitter - Decentralized Social Platform on Sui

A Twitter-like decentralized social media platform built on the Sui blockchain using Move smart contracts. Share your thoughts, engage with the community, and experience true ownership of your social data.

🌐 **Live Demo**: [https://sui-group-5-frontend.vercel.app/](https://sui-group-5-frontend.vercel.app/)

## 👥 Team Members

| Name | Email | GitHub |
|------|-------|--------|
| Ashong Abdallah | ashongabdalla51@gmail.com | [@ashongdev](http://github.com/ashongdev/) |
| Abdulai Taqiudeen | atarqiudeen@gmail.com | [@taqiudeen275](https://github.com/taqiudeen275) |
| Bassell Dari Iddisah | bbasssell16@gmail.com | [@Bassell-Iddisah](https://github.com/Bassell-Iddisah) |
| Sharif Iddrisu| mrgem156@gmail.com | [@noblex1](https://github.com/noblex1/) |

## 🌟 Features

- **Decentralized Profiles**: Create and manage your profile on-chain with username, bio, and profile image
- **Suits (Posts)**: Share your thoughts with the community (up to 280 characters)
- **Likes**: Show appreciation for great content with on-chain likes
- **Comments**: Engage in conversations on posts
- **Real-time Updates**: See new content as it's posted to the blockchain
- **Wallet Integration**: Seamless connection with Sui-compatible wallets
- **Responsive Design**: Works beautifully on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm/yarn
- Sui wallet browser extension (Sui Wallet, Suiet, or Ethos)
- Sui testnet tokens (get from [Sui Discord faucet](https://discord.gg/sui))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd suitter-frontend

# Install frontend dependencies
cd frontend
pnpm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your contract IDs

# Start development server
pnpm dev
```

Visit `http://localhost:5173` and connect your wallet to start using Suitter!

## 📁 Project Structure

```
suitter-frontend/
├── contracts/              # Move smart contracts
│   ├── sources/
│   │   ├── profile.move   # User profile management
│   │   ├── suitter.move   # Core suit/post functionality
│   │   ├── like.move      # Like system
│   │   └── comment.move   # Comment system
│   └── tests/             # Smart contract tests
│
└── frontend/              # React frontend application
    ├── components/        # React components
    │   ├── CreateProfile.tsx
    │   ├── Feed.tsx
    │   ├── SuitCard.tsx
    │   ├── Sidebar.tsx
    │   └── common/        # Reusable UI components
    ├── src/
    │   ├── hooks/         # Custom React hooks for blockchain
    │   └── lib/           # Utilities and constants
    ├── types.ts           # TypeScript type definitions
    └── App.tsx            # Main application component
```

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Query (TanStack Query)
- **Blockchain SDK**: Mysten dApp Kit
- **Styling**: Custom CSS

### Smart Contracts
- **Language**: Move
- **Blockchain**: Sui Network
- **Network**: Testnet

## 🎯 Usage Guide

### 1. Connect Your Wallet
- Click the "Connect Wallet" button in the top right
- Select your Sui wallet extension
- Approve the connection request

### 2. Create Your Profile
- Enter a unique username
- Add a bio (optional)
- Provide a profile image URL (optional)
- Approve the transaction in your wallet

### 3. Create a Suit (Post)
- Type your message in the "What's happening?" box
- Keep it under 280 characters
- Click "Post" and approve the transaction

### 4. Interact with Content
- **Like**: Click the heart icon on any suit
- **Comment**: Click the comment icon to add your thoughts
- **View Profile**: Click on usernames to see profiles

## 🔧 Configuration

### Smart Contract Deployment

1. Deploy the Move contracts:
```bash
cd contracts
sui client publish --gas-budget 100000000
```

2. Note the Package ID and ProfileRegistry object ID from the output

3. Update the frontend configuration:
   - Update `SUITTER_PACKAGE_ID` in `frontend/src/lib/constants.ts`
   - Update `PROFILE_REGISTRY_ID` in `frontend/src/hooks/useProfile.ts`

See `frontend/SETUP.md` for detailed instructions.

## 📚 Documentation

Detailed documentation is available in the `frontend/` directory:

- **[SETUP.md](./frontend/SETUP.md)** - Complete setup and configuration guide
- **[INTEGRATION.md](./frontend/INTEGRATION.md)** - Technical integration details
- **[DEPLOYMENT_CHECKLIST.md](./frontend/DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[QUICK_REFERENCE.md](./frontend/QUICK_REFERENCE.md)** - Developer quick reference
- **[FEATURES_IMPLEMENTED.md](./frontend/FEATURES_IMPLEMENTED.md)** - Feature implementation status

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
pnpm dev  # Development server
pnpm build  # Production build
pnpm preview  # Preview production build
```

### Smart Contract Testing
```bash
cd contracts
sui move test
```

## 🚢 Deployment

The application is deployed at: **[https://sui-group-5-frontend.vercel.app/](https://sui-group-5-frontend.vercel.app/)**

### Deploy Your Own Instance

```bash
# Build the frontend
cd frontend
pnpm build

# Deploy to Vercel
vercel deploy

# Or deploy to Netlify
netlify deploy --dir=dist
```

See `frontend/DEPLOYMENT_CHECKLIST.md` for a complete deployment guide.

## 🔐 Security Features

- No private keys stored in the application
- All transactions require explicit wallet approval
- Input validation on all user inputs
- Secure communication with Sui network via official SDKs
- User-friendly error messages without exposing sensitive data

## 🛠️ Development

### Running Locally

```bash
# Terminal 1: Start frontend
cd frontend
pnpm dev

# Terminal 2: Watch for contract changes (optional)
cd contracts
sui move build --watch
```

### Code Style

- TypeScript for type safety
- React functional components with hooks
- Modular component architecture
- Custom hooks for blockchain interactions
- Comprehensive error handling

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Resources

- **Sui Documentation**: [https://docs.sui.io/](https://docs.sui.io/)
- **Sui Discord**: [https://discord.gg/sui](https://discord.gg/sui)
- **Sui Explorer**: [https://suiexplorer.com/](https://suiexplorer.com/)
- **Mysten dApp Kit**: [https://sdk.mystenlabs.com/dapp-kit](https://sdk.mystenlabs.com/dapp-kit)

## 🎯 Roadmap

- [x] User profiles with on-chain storage
- [x] Create and view suits (posts)
- [x] Like functionality
- [x] Comment system
- [ ] Repost/share functionality
- [ ] User profile pages
- [ ] Follow/unfollow system
- [ ] Search and discovery
- [ ] Notifications
- [ ] Direct messaging
- [ ] Media uploads (images/videos)
- [ ] Hashtags and trending topics

## 🏆 Acknowledgments

- Built on the [Sui blockchain](https://sui.io/)
- Powered by [Mysten Labs](https://mystenlabs.com/) technology
- Inspired by decentralized social media principles

---

**Built with ❤️ on Sui** | [Live Demo](https://sui-group-5-frontend.vercel.app/) | [Report Bug](../../issues) | [Request Feature](../../issues)
