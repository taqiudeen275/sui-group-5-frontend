/**
 * Suitter Contract Constants
 */

// Contract Package ID - Update this after deploying the contract
export const SUITTER_PACKAGE_ID = "0x75ecdc8c9191a89ec25a5f3b24b098efb1bf19a89e79589501dcdfc9c0c04cc9";

// Profile Registry Object ID - Update this after deploying the contract
// This is a shared object created during contract initialization
export const PROFILE_REGISTRY_ID = "0x7ddb1a7616a2ddbad6180ea5ee4648407454b9c0c045ca97ad16c9ccb931d96b";

// Module Names
export const MODULES = {
  SUITTER: "suitter",
  PROFILE: "profile",
  COMMENT: "comment",
  LIKE: "like",
} as const;

// Struct Type Names
export const STRUCT_TYPES = {
  SUIT: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::Suit`,
  SUI_STORE: `${SUITTER_PACKAGE_ID}::${MODULES.SUITTER}::SuiStore`,
  PROFILE: `${SUITTER_PACKAGE_ID}::${MODULES.PROFILE}::Profile`,
  PROFILE_REGISTRY: `${SUITTER_PACKAGE_ID}::${MODULES.PROFILE}::ProfileRegistry`,
  COMMENT: `${SUITTER_PACKAGE_ID}::${MODULES.COMMENT}::Comment`,
  LIKE: `${SUITTER_PACKAGE_ID}::${MODULES.LIKE}::Like`,
} as const;

// Entry Function Names
export const ENTRY_FUNCTIONS = {
  CREATE_AND_KEEP_SUIT: "create_and_keep_suit",
  CREATE_AND_KEEP_COMMENT: "create_and_keep_comment",
  CREATE_AND_KEEP_LIKE: "create_and_keep_like",
  UNLIKE_SUIT: "unlike_suit",
  REPOST_AND_KEEP_SUIT: "repost_and_keep_suit",
  CREATE_AND_KEEP_PROFILE: "create_and_keep_profile",
  UPDATE_PROFILE_BIO: "update_profile_bio",
  UPDATE_PROFILE_IMAGE_URL: "update_profile_image_url",
  UPDATE_PROFILE_USERNAME: "update_profile_username",
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_SUIT_LENGTH: 280,
  MAX_BIO_LENGTH: 160,
  MAX_USERNAME_LENGTH: 30,
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  QUERY_CACHE_TIME: 10 * 60 * 1000, // 10 minutes
} as const;
