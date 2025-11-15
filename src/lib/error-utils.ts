/**
 * Error Utilities
 */

export function parseTransactionError(error: any): string {
  const errorMessage = error?.message || error?.toString() || "";
  const errorString = JSON.stringify(error).toLowerCase();

  if (errorMessage.includes("insufficient") || errorMessage.includes("gas")) {
    return "Insufficient gas to complete transaction. Please add more SUI to your wallet.";
  }

  if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
    return "Transaction was rejected. Please try again.";
  }

  if (errorMessage.includes("network") || errorMessage.includes("timeout")) {
    return "Network error occurred. Please check your connection and try again.";
  }

  if (errorMessage.includes("wallet not connected")) {
    return "Please connect your wallet first.";
  }

  if (errorMessage.includes("USERNAME_ALREADY_TAKEN")) {
    return "This username is already taken. Please choose another.";
  }

  if (errorMessage.includes("PROFILE_ALREADY_EXISTS")) {
    return "You already have a profile.";
  }

  return "An unexpected error occurred. Please try again.";
}
