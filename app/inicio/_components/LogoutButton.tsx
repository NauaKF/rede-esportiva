"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    if (pending) return;

    setPending(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      aria-busy={pending}
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#dce4dc] bg-white px-4 py-2 text-sm font-semibold text-[#30443a] transition-colors hover:border-[#1f4d3a] hover:bg-[#f7faf5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438260] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
