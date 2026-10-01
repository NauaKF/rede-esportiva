import "server-only";

import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

type AccountType = "PLAYER" | "ARENA";
type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

type AccountRow = {
  id: string;
  account_type: AccountType;
  status: AccountStatus;
  password_hash: string;
};

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      accountId: string;
      accountType: AccountType;
      status: AccountStatus;
    };
  }

  interface User {
    accountId: string;
    accountType: AccountType;
    status: AccountStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId?: string;
    accountType?: AccountType;
    status?: AccountStatus;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const rows = await sql`
          SELECT id, account_type, status, password_hash
          FROM accounts
          WHERE lower(btrim(email)) = ${email}
          LIMIT 1
        ` as AccountRow[];
        const account = rows[0];

        if (!account || account.status === "SUSPENDED") return null;
        if (!(await verifyPassword(password, account.password_hash))) return null;

        return {
          id: account.id,
          accountId: account.id,
          accountType: account.account_type,
          status: account.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accountId = user.accountId;
        token.accountType = user.accountType;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accountId && token.accountType && token.status) {
        session.user.accountId = token.accountId;
        session.user.accountType = token.accountType;
        session.user.status = token.status;
      }
      return session;
    },
  },
};

