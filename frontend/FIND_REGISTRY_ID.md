# How to Find the ProfileRegistry Object ID

The ProfileRegistry is a shared object created when the profile module is initialized. You need this ID to create profiles.

## Method 1: From Deployment Output

When you deploy your contracts, look for output similar to:

```
Created Objects:
  - ID: 0xabc123... , Owner: Shared
    Type: 0x<package_id>::profile::ProfileRegistry
```

The ID shown is your `PROFILE_REGISTRY_ID`.

## Method 2: Using Sui CLI

1. **List all objects of ProfileRegistry type**:
   ```bash
   sui client objects --filter StructType \
     --type "<PACKAGE_ID>::profile::ProfileRegistry"
   ```

2. **Or query by package**:
   ```bash
   sui client objects | grep ProfileRegistry
   ```

## Method 3: Using Sui Explorer

1. Go to [Sui Explorer](https://suiexplorer.com/) (or testnet/devnet explorer)
2. Search for your package ID
3. Look for the ProfileRegistry object in the "Objects" tab
4. Copy the object ID

## Method 4: From Transaction Events

If you have the deployment transaction digest:

```bash
sui client transaction <TRANSACTION_DIGEST>
```

Look for created objects with type `ProfileRegistry`.

## Method 5: Using TypeScript/JavaScript

```typescript
import { SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });

async function findRegistryId(packageId: string) {
  const objects = await client.getOwnedObjects({
    owner: packageId,
    filter: {
      StructType: `${packageId}::profile::ProfileRegistry`
    }
  });
  
  console.log("Registry ID:", objects.data[0]?.data?.objectId);
}
```

## Updating the Code

Once you have the ProfileRegistry ID, update it in `src/lib/constants.ts`:

```typescript
export const PROFILE_REGISTRY_ID = "0xYOUR_REGISTRY_ID_HERE";
```

The hook already imports and uses this constant automatically.

## Verification

To verify you have the correct ID:

```bash
sui client object <REGISTRY_ID>
```

You should see output showing:
- Type: `<package_id>::profile::ProfileRegistry`
- Owner: Shared
- Fields containing `profiles` and `usernames` tables

## Common Issues

### "Object not found"
- Make sure you're querying the correct network (testnet/devnet/mainnet)
- Verify the package was deployed successfully
- Check that the ProfileRegistry was created during initialization

### "Invalid object ID"
- Ensure the ID starts with `0x`
- Check for typos in the ID
- Verify the ID is from the correct network

### "Object is not shared"
- The ProfileRegistry should be a shared object
- If it's not shared, there may be an issue with the contract deployment
- Redeploy the contracts if necessary
