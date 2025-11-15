import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ENTRY_FUNCTIONS, MODULES, STRUCT_TYPES, SUITTER_PACKAGE_ID, UI_CONSTANTS, GAS_BUDGET } from "../lib/constants";
import { extractObjectId, parseObjectContent, parseTimestamp } from "../lib/sui-client";
import { parseTransactionError } from "../lib/error-utils";
import type { Profile, ProfileData, Suit, SuitData, SuiStore, SuiStoreData, SuitWithStore } from "../../types";

function transformSuit(data: SuitData): Suit {
  return {
    id: extractObjectId(data.id) || "",
    body: data.body,
    createdAt: parseTimestamp(data.created_at),
  };
}

function transformSuiStore(data: SuiStoreData): SuiStore {
  const likesSize = data.likes?.fields?.size ? parseInt(data.likes.fields.size) : 0;
  const commentsSize = data.comments?.fields?.size ? parseInt(data.comments.fields.size) : 0;
  const repostSize = data.repost?.fields?.size ? parseInt(data.repost.fields.size) : 0;

  return {
    id: extractObjectId(data.id) || "",
    suit: data.suit,
    comments: new Map(),
    repost: new Map(),
    likes: new Map(),
    createdAt: parseTimestamp(data.created_at),
    likesCount: likesSize,
    commentsCount: commentsSize,
    repostCount: repostSize,
  };
}

function transformProfile(data: ProfileData): Profile {
  return {
    id: extractObjectId(data.id) || "",
    owner: data.owner,
    username: data.username,
    bio: data.bio,
    profileImageUrl: data.profile_image_url,
    createdAt: parseTimestamp(data.created_at),
    updatedAt: parseTimestamp(data.updated_at),
  };
}

export interface UseSuitsReturn {
  suits: SuitWithStore[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createSuit: (body: string) => Promise<any>;
  repostSuit: (suitId: string, storeId: string) => Promise<any>;
  refetch: () => void;
}

export function useSuits(): UseSuitsReturn {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const {
    data: suits,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suits"],
    queryFn: async () => {
      try {
        if (!account?.address) {
          return [];
        }

        const suitsResponse = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: STRUCT_TYPES.SUIT,
          },
          options: {
            showContent: true,
            showType: true,
            showOwner: true,
          },
        });

        const storesResponse = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: STRUCT_TYPES.SUI_STORE,
          },
          options: {
            showContent: true,
            showType: true,
            showOwner: true,
          },
        });

        const profilesResponse = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: STRUCT_TYPES.PROFILE,
          },
          options: {
            showContent: true,
            showType: true,
            showOwner: true,
          },
        });

        const suitsList = suitsResponse.data
          .map((obj) => {
            const suitData = parseObjectContent<SuitData>(obj);
            const owner = obj.data?.owner;
            const ownerAddress = typeof owner === "object" && owner !== null && "AddressOwner" in owner 
              ? owner.AddressOwner 
              : null;
            return suitData ? { suit: transformSuit(suitData), owner: ownerAddress } : null;
          })
          .filter((item): item is { suit: Suit; owner: string | null } => item !== null);

        const storesList = storesResponse.data
          .map((obj) => {
            const storeData = parseObjectContent<SuiStoreData>(obj);
            return storeData ? transformSuiStore(storeData) : null;
          })
          .filter((store): store is SuiStore => store !== null);

        const profilesList = profilesResponse.data
          .map((obj) => {
            const profileData = parseObjectContent<ProfileData>(obj);
            return profileData ? transformProfile(profileData) : null;
          })
          .filter((profile): profile is Profile => profile !== null);

        const storesMap = new Map(storesList.map((store) => [store.suit, store]));
        const profilesMap = new Map(profilesList.map((profile) => [profile.owner, profile]));

        const suitsWithStore: SuitWithStore[] = suitsList
          .map(({ suit, owner }) => {
            const store = storesMap.get(suit.id);
            
            let author: Profile | undefined;
            if (owner) {
              author = profilesMap.get(owner);
            }

            if (!store || !author) {
              return null;
            }

            return {
              suit,
              store,
              author,
              isRepost: false,
            };
          })
          .filter((item): item is SuitWithStore => item !== null);

        suitsWithStore.sort((a, b) => b.suit.createdAt - a.suit.createdAt);

        return suitsWithStore;
      } catch (err) {
        console.error("Error fetching suits:", err);
        throw err;
      }
    },
    staleTime: UI_CONSTANTS.QUERY_STALE_TIME,
    gcTime: UI_CONSTANTS.QUERY_CACHE_TIME,
    refetchInterval: 10000,
  });

  const createSuitMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!account?.address) {
        throw new Error("Wallet not connected");
      }

      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET.CREATE_SUIT);

      tx.moveCall({
        target: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::${ENTRY_FUNCTIONS.CREATE_AND_KEEP_SUIT}`,
        arguments: [
          tx.pure.string(body),
        ],
      });

      try {
        const result = await signAndExecuteTransaction({
          transaction: tx,
        });
        return result;
      } catch (error) {
        const friendlyError = new Error(parseTransactionError(error));
        throw friendlyError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suits"] });
    },
  });

  const repostSuitMutation = useMutation({
    mutationFn: async ({ suitId, storeId }: { suitId: string; storeId: string }) => {
      if (!account?.address) {
        throw new Error("Wallet not connected");
      }

      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET.REPOST_SUIT);

      tx.moveCall({
        target: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::${ENTRY_FUNCTIONS.REPOST_AND_KEEP_SUIT}`,
        arguments: [
          tx.object(suitId),
          tx.object(storeId),
        ],
      });

      try {
        const result = await signAndExecuteTransaction({
          transaction: tx,
        });
        return result;
      } catch (error) {
        const friendlyError = new Error(parseTransactionError(error));
        throw friendlyError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suits"] });
    },
  });

  return {
    suits: suits || [],
    isLoading,
    isError,
    error: error as Error | null,
    createSuit: createSuitMutation.mutateAsync,
    repostSuit: async (suitId: string, storeId: string) => {
      await repostSuitMutation.mutateAsync({ suitId, storeId });
    },
    refetch: () => {
      refetch();
    },
  };
}
