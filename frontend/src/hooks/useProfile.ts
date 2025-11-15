import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ENTRY_FUNCTIONS, MODULES, STRUCT_TYPES, SUITTER_PACKAGE_ID, UI_CONSTANTS, PROFILE_REGISTRY_ID, GAS_BUDGET } from "../lib/constants";
import { extractObjectId, parseObjectContent, parseTimestamp } from "../lib/sui-client";
import { parseTransactionError } from "../lib/error-utils";
import type { CreateProfileInput, Profile, ProfileData } from "../../types";

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

export interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createProfile: (data: CreateProfileInput) => Promise<any>;
  updateBio: (bio: string) => Promise<any>;
  updateProfileImage: (url: string) => Promise<any>;
  refetch: () => void;
}

export function useProfile(): UseProfileReturn {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile", account?.address],
    queryFn: async () => {
      if (!account?.address) {
        return null;
      }

      try {
        const response = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: STRUCT_TYPES.PROFILE,
          },
          options: {
            showContent: true,
            showType: true,
          },
        });

        if (response.data.length === 0) {
          return null;
        }

        const profileObj = response.data[0];
        const profileData = parseObjectContent<ProfileData>(profileObj);

        if (!profileData) {
          return null;
        }

        return transformProfile(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        throw err;
      }
    },
    enabled: !!account?.address,
    staleTime: UI_CONSTANTS.QUERY_STALE_TIME,
    gcTime: UI_CONSTANTS.QUERY_CACHE_TIME,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: CreateProfileInput) => {
      if (!account?.address) {
        throw new Error("Wallet not connected");
      }

      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET.CREATE_PROFILE);

      tx.moveCall({
        target: `${SUITTER_PACKAGE_ID}::${MODULES.PROFILE}::${ENTRY_FUNCTIONS.CREATE_AND_KEEP_PROFILE}`,
        arguments: [
          tx.object(PROFILE_REGISTRY_ID),
          tx.pure.string(data.username),
          tx.pure.string(data.bio),
          tx.pure.string(data.profileImageUrl),
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
      queryClient.invalidateQueries({ queryKey: ["profile", account?.address] });
    },
  });

  const updateBioMutation = useMutation({
    mutationFn: async (bio: string) => {
      if (!account?.address) {
        throw new Error("Wallet not connected");
      }

      if (!profile) {
        throw new Error("No profile found");
      }

      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET.UPDATE_PROFILE);

      tx.moveCall({
        target: `${SUITTER_PACKAGE_ID}::${MODULES.PROFILE}::${ENTRY_FUNCTIONS.UPDATE_PROFILE_BIO}`,
        arguments: [
          tx.object(profile.id),
          tx.pure.string(bio),
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
      queryClient.invalidateQueries({ queryKey: ["profile", account?.address] });
    },
  });

  const updateProfileImageMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!account?.address) {
        throw new Error("Wallet not connected");
      }

      if (!profile) {
        throw new Error("No profile found");
      }

      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET.UPDATE_PROFILE);

      tx.moveCall({
        target: `${SUITTER_PACKAGE_ID}::${MODULES.PROFILE}::${ENTRY_FUNCTIONS.UPDATE_PROFILE_IMAGE_URL}`,
        arguments: [
          tx.object(profile.id),
          tx.pure.string(url),
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
      queryClient.invalidateQueries({ queryKey: ["profile", account?.address] });
    },
  });

  return {
    profile: profile || null,
    isLoading,
    isError,
    error: error as Error | null,
    createProfile: createProfileMutation.mutateAsync,
    updateBio: updateBioMutation.mutateAsync,
    updateProfileImage: updateProfileImageMutation.mutateAsync,
    refetch: () => {
      refetch();
    },
  };
}
