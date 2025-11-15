# Suitter Deployment Checklist

Use this checklist to ensure proper deployment of the Suitter frontend.

## Pre-Deployment

### 1. Smart Contract Deployment
- [ ] Deploy contracts to target network (testnet/devnet/mainnet)
- [ ] Save the package ID from deployment output
- [ ] Locate the ProfileRegistry object ID
- [ ] Test contract functions using Sui CLI
- [ ] Verify all objects are created correctly

### 2. Configuration Updates
- [ ] Update `SUITTER_PACKAGE_ID` in `src/lib/constants.ts`
- [ ] Update `PROFILE_REGISTRY_ID` in `src/hooks/useProfile.ts`
- [ ] Set correct network in `index.tsx` (testnet/devnet/mainnet)
- [ ] Create `.env.local` with `VITE_SUI_NETWORK`
- [ ] Verify all contract addresses are correct

### 3. Dependencies
- [ ] Run `pnpm install` to install all dependencies
- [ ] Verify no dependency conflicts
- [ ] Check for security vulnerabilities: `pnpm audit`
- [ ] Update outdated packages if needed

### 4. Code Quality
- [ ] Run TypeScript check: `pnpm tsc --noEmit`
- [ ] Check for linting errors
- [ ] Review all TODO comments
- [ ] Remove console.log statements (or use proper logging)
- [ ] Remove commented-out code

## Testing

### 5. Local Testing
- [ ] Start dev server: `pnpm dev`
- [ ] Test wallet connection
- [ ] Test profile creation
- [ ] Test suit creation
- [ ] Test like/unlike functionality
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test on different screen sizes
- [ ] Test on different browsers (Chrome, Firefox, Safari)

### 6. Network Testing
- [ ] Test on correct Sui network
- [ ] Verify transactions appear in Sui Explorer
- [ ] Check gas costs are reasonable
- [ ] Test with low gas balance
- [ ] Test transaction failures

### 7. User Experience
- [ ] All buttons work correctly
- [ ] Loading indicators show during transactions
- [ ] Error messages are user-friendly
- [ ] Success feedback is clear
- [ ] Navigation is intuitive
- [ ] Images load correctly
- [ ] Timestamps display correctly

## Build

### 8. Production Build
- [ ] Run `pnpm build`
- [ ] Check build output for errors
- [ ] Verify bundle size is reasonable
- [ ] Test production build locally: `pnpm preview`
- [ ] Check for any warnings in build output

### 9. Environment Variables
- [ ] Set production environment variables
- [ ] Verify API endpoints are correct
- [ ] Check network configuration
- [ ] Ensure no sensitive data in code

## Deployment

### 10. Hosting Setup
Choose your hosting platform:

#### Vercel
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run `vercel` in project directory
- [ ] Set environment variables in Vercel dashboard
- [ ] Configure build settings (Build Command: `pnpm build`, Output Directory: `dist`)
- [ ] Deploy: `vercel --prod`

#### Netlify
- [ ] Install Netlify CLI: `npm i -g netlify-cli`
- [ ] Run `netlify deploy`
- [ ] Set environment variables in Netlify dashboard
- [ ] Configure build settings
- [ ] Deploy to production: `netlify deploy --prod`

#### GitHub Pages
- [ ] Update `vite.config.ts` with base path
- [ ] Build project
- [ ] Push to gh-pages branch
- [ ] Enable GitHub Pages in repository settings

### 11. Domain Configuration
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificate
- [ ] Update DNS records
- [ ] Test domain access
- [ ] Set up redirects (www to non-www or vice versa)

### 12. Post-Deployment Verification
- [ ] Visit deployed URL
- [ ] Test wallet connection on production
- [ ] Create a test profile
- [ ] Create a test suit
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Verify transactions on Sui Explorer
- [ ] Test on mobile devices
- [ ] Test on different networks (WiFi, mobile data)

## Monitoring

### 13. Analytics & Monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics (e.g., Google Analytics)
- [ ] Monitor transaction success rates
- [ ] Track user engagement
- [ ] Set up uptime monitoring

### 14. Documentation
- [ ] Update README with deployment URL
- [ ] Document any deployment-specific configurations
- [ ] Create user guide
- [ ] Document known issues
- [ ] Update changelog

## Security

### 15. Security Checks
- [ ] No private keys in code
- [ ] No sensitive data exposed
- [ ] HTTPS enabled
- [ ] Content Security Policy configured
- [ ] CORS properly configured
- [ ] Input validation in place
- [ ] Rate limiting considered

## Maintenance

### 16. Post-Launch
- [ ] Monitor error logs
- [ ] Track user feedback
- [ ] Plan for updates
- [ ] Set up backup strategy
- [ ] Document maintenance procedures
- [ ] Create rollback plan

## Rollback Plan

### 17. If Issues Occur
- [ ] Keep previous deployment accessible
- [ ] Document rollback procedure
- [ ] Test rollback process
- [ ] Have emergency contacts ready
- [ ] Monitor after rollback

## Network-Specific Checklists

### Testnet Deployment
- [ ] Use testnet faucet for testing
- [ ] Inform users it's testnet
- [ ] Add testnet warning banner
- [ ] Document how to get testnet SUI

### Mainnet Deployment
- [ ] Audit smart contracts
- [ ] Test thoroughly on testnet first
- [ ] Have support plan ready
- [ ] Monitor gas costs
- [ ] Plan for scaling
- [ ] Set up customer support

## Final Checks

- [ ] All items above completed
- [ ] Team reviewed deployment
- [ ] Backup created
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] Users notified (if applicable)

## Emergency Contacts

- Smart Contract Developer: _______________
- Frontend Developer: _______________
- DevOps: _______________
- Support: _______________

## Deployment Date

- Planned: _______________
- Actual: _______________
- Network: _______________
- Package ID: _______________
- Registry ID: _______________
- Deployment URL: _______________

## Notes

_Add any deployment-specific notes here_

---

**Remember**: Always test on testnet before deploying to mainnet!
