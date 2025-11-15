# Suitter Frontend Setup Guide

This guide will help you set up and run the Suitter frontend with Sui blockchain integration.

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- A Sui wallet (e.g., Sui Wallet browser extension)
- Deployed Suitter smart contracts on Sui testnet/devnet

## Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```
   VITE_SUI_NETWORK=testnet
   ```

## Smart Contract Configuration

After deploying your smart contracts, you need to update the configuration:

### 1. Get Package ID

After deploying the contracts, you'll receive a package ID. Update it in `src/lib/constants.ts`:

```typescript
export const SUITTER_PACKAGE_ID = "0xYOUR_PACKAGE_ID_HERE";
```

### 2. Get Profile Registry ID

The ProfileRegistry is a shared object created during contract initialization. To find it:

**Option A: From deployment output**
Look for the ProfileRegistry object ID in your deployment transaction output.

**Option B: Query from blockchain**
```bash
sui client object <PACKAGE_ID>::profile::ProfileRegistry
```

Update it in `src/lib/constants.ts`:
```typescript
export const PROFILE_REGISTRY_ID = "0xYOUR_REGISTRY_ID_HERE";
```

## Running the Application

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Open your browser**:
   Navigate to `http://localhost:5173` (or the port shown in terminal)

3. **Connect your wallet**:
   - Click "Connect Wallet"
   - Select your Sui wallet
   - Approve the connection

4. **Create your profile**:
   - If you don't have a profile, you'll see the profile creation form
   - Fill in your username, bio, and optional profile image URL
   - Click "Create Profile" and approve the transaction

5. **Start using Suitter**:
   - Create suits (posts)
   - Like other suits
   - Comment on suits
   - Repost suits

## Network Configuration

The app supports multiple Sui networks. To change the network:

1. Update `index.tsx`:
   ```typescript
   <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
   ```
   Change `"testnet"` to `"devnet"` or `"mainnet"` as needed.

2. Make sure your contracts are deployed on the same network.

## Troubleshooting

### "Wallet not connected" error
- Make sure you have a Sui wallet extension installed
- Click the "Connect Wallet" button
- Approve the connection in your wallet

### "Profile Registry not found" error
- Make sure you've updated the `PROFILE_REGISTRY_ID` in the code
- Verify the registry exists on the blockchain
- Check that you're connected to the correct network

### "Insufficient gas" error
- Make sure your wallet has enough SUI tokens
- Get testnet SUI from the faucet: https://discord.com/channels/916379725201563759/971488439931392130

### Transaction fails
- Check the browser console for detailed error messages
- Verify your contract package ID is correct
- Make sure you're on the correct network

## Development

### Project Structure

```
suitter-frontend/
├── src/
│   ├── hooks/           # Custom hooks for blockchain interaction
│   │   ├── useProfile.ts
│   │   ├── useSuits.ts
│   │   ├── useLikes.ts
│   │   └── useComments.ts
│   ├── lib/             # Utility functions and constants
│   │   ├── constants.ts
│   │   ├── sui-client.ts
│   │   └── error-utils.ts
│   └── networkConfig.ts # Network configuration
├── components/          # React components
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

### Adding New Features

1. **Add new contract functions**:
   - Update `ENTRY_FUNCTIONS` in `src/lib/constants.ts`
   - Create or update hooks in `src/hooks/`

2. **Add new types**:
   - Update `types.ts` with new data structures

3. **Create UI components**:
   - Add components in `components/`
   - Use the hooks to interact with the blockchain

## Testing

### Manual Testing Checklist

- [ ] Connect wallet
- [ ] Create profile
- [ ] Create a suit
- [ ] Like a suit
- [ ] Unlike a suit
- [ ] Add a comment
- [ ] Repost a suit
- [ ] Update profile bio
- [ ] Update profile image

### Test on Different Networks

1. Deploy contracts to devnet
2. Update configuration
3. Test all features
4. Deploy to testnet
5. Update configuration
6. Test all features again

## Deployment

### Build for Production

```bash
pnpm build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Hosting

You can deploy to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Configure in repository settings

Make sure to set environment variables in your hosting platform.

## Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Mysten dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [React Query Documentation](https://tanstack.com/query/latest)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the INTEGRATION.md file for technical details
3. Check the Sui Discord community
