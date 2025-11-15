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
        // Query all SuiStore objects (they are shared objects)
        // Note: This is a simplified approach. In production, use an indexer or event-based approach
        const storesResponse = await suiClient.queryEvents({
          query: {
            MoveEventType: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::SuitCreated`,
          },
          limit: 50,
          order: "descending",
        });

        if (!storesResponse.data || storesResponse.data.length === 0) {
          return [];
        }

        // Fetch each suit and its store
        const suitsWithStorePromises = storesResponse.data.map(async (event) => {
          try {
            const eventData = event.parsedJson as any;
            const storeId = eventData.suit_store_id;
            const authorAddress = eventData.author;

            // Fetch the store object
            const storeObject = await suiClient.getObject({
              id: storeId,
              options: {
                showContent: true,
                showType: true,
              },
            });

            if (!storeObject.data?.content || storeObject.data.content.dataType !== "moveObject") {
              return null;
            }

            const storeData = parseObjectContent<SuiStoreData>(storeObject);
            if (!storeData) return null;

            const store = transformSuiStore(storeData);
            const suitId = store.suit;

            // Fetch the suit object
            const suitObject = await suiClient.getObject({
              id: suitId,
              options: {
                showContent: true,
                showType: true,
              },
            });

            if (!suitObject.data?.content || suitObject.data.content.dataType !== "moveObject") {
              return null;
            }

            const suitData = parseObjectContent<SuitData>(suitObject);
            if (!suitData) return null;

            const suit = transformSuit(suitData);

            // Fetch author profile
            let author: Profile | undefined;
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
                }
              }
            } catch (err) {
              console.warn("Could not fetch profile for author:", authorAddress);
            }

            // If no profile, create a default one
            if (!author) {
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
            console.error("Error fetching suit details:", err);
            return null;
          }
        });

        const suitsWithStore = await Promise.all(suitsWithStorePromises);
        const validSuits = suitsWithStore.filter((item): item is SuitWithStore => item !== null);

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
