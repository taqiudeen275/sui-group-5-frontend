import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ENTRY_FUNCTIONS, MODULES, STRUCT_TYPES, SUITTER_PACKAGE_ID, UI_CONSTANTS, GAS_BUDGET } from "../lib/constants";
import { extractObjectId, parseObjectContent, parseTimestamp } from "../lib/sui-client";
import { parseTransactionError } from "../lib/error-utils";
import type { Comment, CommentData, Profile, ProfileData } from "../../types";

function transformComment(data: CommentData): Comment {
  return {
    id: extractObjectId(data.id) || "",
    user: data.user,
    createdAt: parseTimestamp(data.created_at),
    content: data.content,
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

export interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  addComment: (storeId: string, text: string) => Promise<void>;
  getCommentCount: (storeId: string) => number;
  refetch: () => void;
}

export function useComments(suitId?: string): UseCommentsReturn {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const {
    data: comments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", suitId],
    queryFn: async () => {
      if (!suitId) {
        return [];
      }

      try {
        const suitsData = queryClient.getQueryData<any[]>(["suits"]);
        let storeId: string | null = null;
        
        if (suitsData) {
          const suit = suitsData.find((s) => s.suit.id === suitId);
          if (suit) {
            storeId = suit.store.id;
          }
        }

        if (!storeId) {
          console.warn("Store ID not found for suit:", suitId);
          return [];
        }

        const storeObject = await suiClient.getObject({
          id: storeId,
          options: {
            showContent: true,
          },
        });

        if (!storeObject.data?.content || storeObject.data.content.dataType !== "moveObject") {
          return [];
        }

        const storeFields = storeObject.data.content.fields as any;
        const commentsTable = storeFields.comments;

        if (!commentsTable || !commentsTable.fields) {
          return [];
        }

        const tableId = commentsTable.fields.id.id;

        const dynamicFields = await suiClient.getDynamicFields({
          parentId: tableId,
        });

        if (dynamicFields.data.length === 0) {
          return [];
        }

        const commentPromises = dynamicFields.data.map(async (field) => {
          try {
            if (!field.name || typeof field.name !== "object" || !("value" in field.name)) {
              return null;
            }

            const commentId = field.name.value as string;
            
            const commentObject = await suiClient.getObject({
              id: commentId,
              options: {
                showContent: true,
                showOwner: true,
              },
            });

            if (!commentObject.data?.content || commentObject.data.content.dataType !== "moveObject") {
              return null;
            }

            const commentData = parseObjectContent<CommentData>(commentObject);
            if (!commentData) {
              return null;
            }
            const comment = transformComment(commentData);

            let author: Profile | undefined;
            try {
              const profileResponse = await suiClient.getOwnedObjects({
                owner: comment.user,
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
              console.warn("Could not fetch profile for comment author:", err);
            }

            return {
              ...comment,
              author,
            };
          } catch (err) {
            console.error("Error fetching comment:", err);
            return null;
          }
        });

        const fetchedComments = await Promise.all(commentPromises);
        const validComments = fetchedComments
          .filter((comment): comment is NonNullable<typeof comment> => comment !== null)
          .sort((a, b) => a.createdAt - b.createdAt) as Comment[];

        return validComments;
      } catch (err) {
        console.error("Error fetching comments:", err);
        throw err;
      }
    },
    enabled: !!suitId,
    staleTime: UI_CONSTANTS.QUERY_STALE_TIME,
    gcTime: UI_CONSTANTS.QUERY_CACHE_TIME,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ storeId, text }: { storeId: string; text: string }) => {
      if (!account?.address) {
        throw new Error("Wallet not connected");
      }

      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET.CREATE_COMMENT);

      tx.moveCall({
        target: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::${ENTRY_FUNCTIONS.CREATE_AND_KEEP_COMMENT}`,
        arguments: [
          tx.pure.string(text),
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
      queryClient.invalidateQueries({ queryKey: ["comments", suitId] });
      queryClient.invalidateQueries({ queryKey: ["suits"] });
    },
  });

  const getCommentCount = (storeId: string): number => {
    const suitsData = queryClient.getQueryData<any[]>(["suits"]);
    if (suitsData) {
      const suit = suitsData.find((s) => s.store.id === storeId);
      if (suit && suit.store.commentsCount !== undefined) {
        return suit.store.commentsCount;
      }
    }
    return 0;
  };

  return {
    comments: comments || [],
    isLoading,
    isError,
    error: error as Error | null,
    addComment: async (storeId: string, text: string) => {
      await addCommentMutation.mutateAsync({ storeId, text });
    },
    getCommentCount,
    refetch: () => {
      refetch();
    },
  };
}
