import "server-only";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { sql } from "@/lib/db";

type AccountType = "PLAYER" | "ARENA";
type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

type AccountRow = {
  account_id: string;
  account_type: AccountType;
  status: AccountStatus;
};

export type RequiredAccount = {
  accountId: string;
  accountType: AccountType;
  status: Exclude<AccountStatus, "SUSPENDED">;
};

export async function requireAccount(): Promise<RequiredAccount> {
  const session = await getServerSession(authOptions);
  const accountId = session?.user?.accountId;

  if (!accountId) redirect("/login");

  let account: AccountRow | undefined;
  try {
    const rows = await sql`
      SELECT id AS account_id, account_type, status
      FROM accounts
      WHERE id = ${accountId}
      LIMIT 1
    ` as AccountRow[];
    account = rows[0];
  } catch {
    // Fail closed when account status cannot be confirmed.
    redirect("/login");
  }

  if (
    !account ||
    account.status === "SUSPENDED" ||
    (account.status !== "PENDING" && account.status !== "ACTIVE") ||
    (account.account_type !== "PLAYER" && account.account_type !== "ARENA")
  ) {
    redirect("/login");
  }

  return {
    accountId: account.account_id,
    accountType: account.account_type,
    status: account.status,
  };
}
