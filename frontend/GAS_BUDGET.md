# Gas Budget Configuration

## Overview

All transactions in Suitter now have explicit gas budgets set to ensure reliable execution and prevent transaction failures due to insufficient gas.

## Gas Budget Values

Gas budgets are defined in MIST (1 SUI = 1,000,000,000 MIST):

```typescript
export const GAS_BUDGET = {
  CREATE_PROFILE: 100_000_000,    // 0.1 SUI
  UPDATE_PROFILE: 50_000_000,     // 0.05 SUI
  CREATE_SUIT: 50_000_000,        // 0.05 SUI
  CREATE_LIKE: 30_000_000,        // 0.03 SUI
  UNLIKE_SUIT: 30_000_000,        // 0.03 SUI
  CREATE_COMMENT: 50_000_000,     // 0.05 SUI
  REPOST_SUIT: 50_000_000,        // 0.05 SUI
} as const;
```

## Why Set Gas Budgets?

### Benefits

1. **Predictable Costs**: Users know exactly how much gas each operation will cost
2. **Prevent Failures**: Transactions won't fail due to insufficient gas estimation
3. **Better UX**: Wallet shows accurate gas costs before signing
4. **Optimization**: Can fine-tune budgets based on actual usage

### Without Gas Budget

If gas budget is not set:
- Sui SDK estimates gas automatically
- Estimation might be too low for complex operations
- Transactions may fail after signing
- Users waste gas on failed transactions

## Implementation

### In Hooks

Each hook sets the gas budget before executing the transaction:

```typescript
const tx = new Transaction();
tx.setGasBudget(GAS_BUDGET.CREATE_SUIT);

tx.moveCall({
  target: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::${ENTRY_FUNCTIONS.CREATE_AND_KEEP_SUIT}`,
  arguments: [tx.pure.string(body)],
});

await signAndExecuteTransaction({ transaction: tx });
```

### Hooks Updated

- ✅ **useProfile.ts**
  - `createProfile()` - 0.1 SUI
  - `updateBio()` - 0.05 SUI
  - `updateProfileImage()` - 0.05 SUI

- ✅ **useSuits.ts**
  - `createSuit()` - 0.05 SUI
  - `repostSuit()` - 0.05 SUI

- ✅ **useLikes.ts**
  - `likeSuit()` - 0.03 SUI
  - `unlikeSuit()` - 0.03 SUI

- ✅ **useComments.ts**
  - `addComment()` - 0.05 SUI

## Gas Budget Rationale

### Profile Operations (0.05-0.1 SUI)

**CREATE_PROFILE: 0.1 SUI**
- Creates Profile object
- Updates ProfileRegistry (shared object)
- Adds to two tables (profiles, usernames)
- Most expensive operation

**UPDATE_PROFILE: 0.05 SUI**
- Modifies existing Profile object
- Simpler than creation

### Suit Operations (0.05 SUI)

**CREATE_SUIT: 0.05 SUI**
- Creates Suit object
- Creates SuiStore object (with tables)
- Shares SuiStore object

**REPOST_SUIT: 0.05 SUI**
- Creates new Suit object
- Creates new SuiStore object
- Updates original SuiStore

**CREATE_COMMENT: 0.05 SUI**
- Creates Comment object
- Updates SuiStore table

### Like Operations (0.03 SUI)

**CREATE_LIKE: 0.03 SUI**
- Creates Like object
- Updates SuiStore table
- Simpler operation

**UNLIKE_SUIT: 0.03 SUI**
- Removes from SuiStore table
- Simplest operation

## Adjusting Gas Budgets

### When to Adjust

Adjust gas budgets if:
1. Transactions consistently fail with "insufficient gas"
2. Actual gas usage is much lower than budget
3. Contract logic changes significantly
4. Network gas prices change

### How to Adjust

1. Monitor actual gas usage in Sui Explorer
2. Update values in `src/lib/constants.ts`
3. Test thoroughly on testnet
4. Deploy to production

### Example: Increasing Budget

```typescript
// Before
CREATE_PROFILE: 100_000_000, // 0.1 SUI

// After (if needed)
CREATE_PROFILE: 150_000_000, // 0.15 SUI
```

## Testing Gas Budgets

### On Testnet

1. Execute each transaction type
2. Check Sui Explorer for actual gas used
3. Compare with set budget
4. Adjust if needed

### Monitoring

```bash
# View transaction details
sui client transaction <DIGEST>

# Look for:
# - Gas Used
# - Gas Budget
# - Status (success/failure)
```

### Example Output

```
Gas Used: 45,234,567 MIST (0.045 SUI)
Gas Budget: 50,000,000 MIST (0.05 SUI)
Status: Success
```

## Best Practices

### Setting Budgets

1. **Start Conservative**: Set higher budgets initially
2. **Monitor Usage**: Track actual gas consumption
3. **Optimize**: Lower budgets based on real data
4. **Leave Buffer**: Keep 10-20% buffer above actual usage

### User Communication

1. **Show Costs**: Display gas costs in UI before transactions
2. **Explain Fees**: Help users understand what they're paying for
3. **Provide Estimates**: Show approximate costs in USD/SUI

### Error Handling

```typescript
try {
  await createSuit(body);
} catch (error) {
  if (error.message.includes("insufficient gas")) {
    alert("Transaction requires more gas. Please try again.");
  }
}
```

## Gas Cost Comparison

| Operation | Gas Budget | Approx. USD* |
|-----------|-----------|--------------|
| Create Profile | 0.1 SUI | $0.10 |
| Update Profile | 0.05 SUI | $0.05 |
| Create Suit | 0.05 SUI | $0.05 |
| Like Suit | 0.03 SUI | $0.03 |
| Unlike Suit | 0.03 SUI | $0.03 |
| Add Comment | 0.05 SUI | $0.05 |
| Repost Suit | 0.05 SUI | $0.05 |

*Assuming 1 SUI = $1 USD (prices vary)

## Troubleshooting

### Transaction Fails: "Insufficient Gas"

**Solution**: Increase gas budget for that operation

```typescript
// In constants.ts
CREATE_SUIT: 75_000_000, // Increased from 50M
```

### Transaction Succeeds but Uses Much Less Gas

**Solution**: Lower gas budget to save users money

```typescript
// If actual usage is ~20M MIST
CREATE_LIKE: 25_000_000, // Decreased from 30M
```

### Wallet Shows Different Gas Amount

**Explanation**: Wallet may add its own buffer or fees. The set budget is the maximum that will be charged.

## Future Improvements

### Dynamic Gas Budgets

Consider implementing dynamic gas budgets based on:
- Network congestion
- Historical usage data
- Transaction complexity

### Gas Optimization

Potential optimizations:
1. Batch operations to reduce per-transaction overhead
2. Optimize contract code to use less gas
3. Use more efficient data structures
4. Cache frequently accessed data

### User Options

Allow users to:
- Choose gas budget (fast/normal/slow)
- Set custom gas budgets
- View gas usage history

## Resources

- [Sui Gas Documentation](https://docs.sui.io/concepts/tokenomics/gas-in-sui)
- [Transaction Building](https://docs.sui.io/guides/developer/sui-101/building-ptb)
- [Gas Pricing](https://docs.sui.io/concepts/tokenomics/gas-pricing)

## Summary

Gas budgets are now set for all transactions in Suitter, ensuring:
- ✅ Reliable transaction execution
- ✅ Predictable costs for users
- ✅ Better error handling
- ✅ Improved user experience

All budgets are configurable in `src/lib/constants.ts` and can be adjusted based on actual usage patterns.
