import { handleDeleteAccount } from "@/features/auth/api";

export async function DELETE() {
  return handleDeleteAccount();
}
