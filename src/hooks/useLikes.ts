import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENTRY_FUNCTIONS, MODULES, SUITTER_PACKAGE_ID } from "../lib/constants";
import { parseTransactionError } from "../lib/error-utils";

interface StoreLikeData {
  count: number;
  userLikeId: string | null;
}

export interface UseLikesReturn {
  likeSuit: (storeId: string) => Promise<any>;
  unlikeSuit: (storeId: string, likeId: string) => Promise<any>;
  isLiked: (storeId: string) => boolean;
  getLikeId: (storeId: string) => string | null;
  getLikeCount: (storeId: string) => number;
  getStoreLikeData: (storeId: string) => StoreLikeData;
}

export function useLikes(): UseLikesReturn {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const fetchStoreLikeData = async (storeId: string): Promise<StoreLikeData> => {
    try {
      const storeObject = await suiClient.getObject({
        id: storeId,
        options: {
          showContent: true,
        },
      });

      if (!storeObject.data?.content || storeObject.data.content.dataType !== "moveObject") {
        return { count: 0, userLikeId: null };
      }

      const fields = storeObject.data.content.fields as any;
      const likesTable = fields.likes;

      if (!likesTable || !likesTable.fields) {
        return { count: 0, userLikeId: null };
      }

      const tableId = likesTable.fields.id.id;

      const dynamicFields = await suiClient.getDynamicFields({
        parentId: tableId,
      });

      const likeCount = dynamicFields.data.length;

      let userLikeId: string | null = null;
      if (account?.address) {
        try {
          const fieldObject = await suiClient.getDynamicFieldObject({
            parentId: tableId,
            name: {
              type: "address",
              value: account.address,
            },
          });
          if (fieldObject.data?.content && fieldObject.data.content.dataType === "moveObject") {
            userLikeId = (fieldObject.data.content.fields as any).value;
          }
        } catch (err) {
          userLikeId = null;
        }
      }

      return { count: likeCount, userLikeId };
    } catch (error) {
      console.error("Error getting like data for store:", error);
      return { count: 0, userLikeId: null };
    }
  };

  const likeSuitMutation = useMutation({
    mutationFn: async (storeId: string) => {
      if (!account?.address) {
        throw new Error("Wallet not connected");
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::${ENTRY_FUNCTIONS.CREATE_AND_KEEP_LIKE}`,
        arguments: [
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
    onSuccess: (_result, storeId) => {
      queryClient.invalidateQueries({ queryKey: ["storeLikeData", storeId] });
      queryClient.invalidateQueries({ queryKey: ["suits"] });
    },
  });

  const unlikeSuitMutation = useMutation({
    mutationFn: async ({ storeId }: { storeId: string; likeId: string }) => {
      if (!account?.address) {
        throw new Error("Wallet not connected");
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::${ENTRY_FUNCTIONS.UNLIKE_SUIT}`,
        arguments: [
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
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["storeLikeData", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["suits"] });
    },
  });

  const getStoreLikeData = (storeId: string): StoreLikeData => {
    const cachedData = queryClient.getQueryData<StoreLikeData>(["storeLikeData", storeId]);
    
    if (cachedData) {
      return cachedData;
    }

    queryClient.fetchQuery({
      queryKey: ["storeLikeData", storeId],
      queryFn: () => fetchStoreLikeData(storeId),
      staleTime: 5000,
    });

    return { count: 0, userLikeId: null };
  };

  const isLiked = (storeId: string): boolean => {
    const data = getStoreLikeData(storeId);
    return data.userLikeId !== null;
  };

  const getLikeId = (storeId: string): string | null => {
    const data = getStoreLikeData(storeId);
    return data.userLikeId;
  };

  const getLikeCount = (storeId: string): number => {
    const data = getStoreLikeData(storeId);
    return data.count;
  };

  return {
    likeSuit: likeSuitMutation.mutateAsync,
    unlikeSuit: async (storeId: string, likeId: string) => {
      await unlikeSuitMutation.mutateAsync({ storeId, likeId });
    },
    isLiked,
    getLikeId,
    getLikeCount,
    getStoreLikeData,
  };
}
