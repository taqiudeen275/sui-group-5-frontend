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
        // For now, return empty array since we need an indexer or better query method
        // The issue is that SuiStore is shared and we can't easily query all shared objects
        // In production, you would use:
        // 1. A Sui indexer service
        // 2. A custom backend that tracks all suits
        // 3. Query events and maintain a local cache
        
        // Temporary solution: Query events to get suit IDs and authors
        const eventsResponse = await suiClient.queryEvents({
          query: {
            MoveEventType: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::SuitCreated`,
          },
          limit: 50,
          order: "descending",
        });

        if (!eventsResponse.data || eventsResponse.data.length === 0) {
          return [];
        }

        // Fetch each suit
        const suitsPromises = eventsResponse.data.map(async (event) => {
          try {
            const eventData = event.parsedJson as any;
            const suitId = eventData.suit_store_id; // This is actually the suit ID
            const authorAddress = eventData.author;
            const transactionDigest = event.id.txDigest;

            // Fetch the suit object
            const suitObject = await suiClient.getObject({
              id: suitId,
              options: {
                showContent: true,
              },
            });

            if (!suitObject.data?.content || suitObject.data.content.dataType !== "moveObject") {
              return null;
            }

            const suitData = parseObjectContent<SuitData>(suitObject);
            if (!suitData) return null;

            const suit = transformSuit(suitData);

            // Get the transaction to find the created SuiStore object
            let storeId: string | null = null;
            try {
              const txResponse = await suiClient.getTransactionBlock({
                digest: transactionDigest,
                options: {
                  showObjectChanges: true,
                },
              });

              // Find the created SuiStore object
              const objectChanges = txResponse.objectChanges || [];
              for (const change of objectChanges) {
                if (
                  change.type === 'created' &&
                  change.objectType.includes('::suitter::SuiStore')
                ) {
                  storeId = change.objectId;
                  break;
                }
              }
            } catch (err) {
              console.warn("Could not fetch transaction for store ID:", err);
            }

            // If we couldn't find the store ID, skip this suit
            if (!storeId) {
              console.warn("Could not find store ID for suit:", suitId);
              return null;
            }

            // Fetch the actual store object
            let store: SuiStore;
            try {
              const storeObject = await suiClient.getObject({
                id: storeId,
                options: {
                  showContent: true,
                },
              });

              if (storeObject.data?.content && storeObject.data.content.dataType === "moveObject") {
                const storeData = parseObjectContent<SuiStoreData>(storeObject);
                if (storeData) {
                  store = transformSuiStore(storeData);
                } else {
                  throw new Error("Could not parse store data");
                }
              } else {
                throw new Error("Store object not found");
              }
            } catch (err) {
              console.warn("Could not fetch store object:", err);
              // Fallback to placeholder
              store = {
                id: storeId,
                suit: suitId,
                comments: new Map(),
                repost: new Map(),
                likes: new Map(),
                createdAt: suit.createdAt,
                likesCount: 0,
                commentsCount: 0,
                repostCount: 0,
              };
            }

            // Fetch author profile
            let author: Profile;
            try {
              const profileResponse = await suiClient.getOwnedObjects({
                owner: authorAddress,
                filter: {
                  StructType: STRUCT_TYPES.PROFILE,
                },
                options: {
                  showContent: true,
                },
              });

              if (profileResponse.data.length > 0) {
                const profileData = parseObjectContent<ProfileData>(profileResponse.data[0]);
                if (profileData) {
                  author = transformProfile(profileData);
                } else {
                  throw new Error("No profile data");
                }
              } else {
                throw new Error("No profile found");
              }
            } catch (err) {
              // Create default profile
              author = {
                id: authorAddress,
                owner: authorAddress,
                username: `User ${authorAddress.slice(0, 6)}`,
                bio: '',
                profileImageUrl: 'https://picsum.photos/200',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
            }

            return {
              suit,
              store,
              author,
              isRepost: false,
            };
          } catch (err) {
            console.error("Error fetching suit:", err);
            return null;
          }
        });

        const fetchedSuits = await Promise.all(suitsPromises);
        const validSuits = fetchedSuits.filter((item): item is SuitWithStore => item !== null);

        // Sort by creation time (newest first)
        validSuits.sort((a, b) => b.suit.createdAt - a.suit.createdAt);

        return validSuits;
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
