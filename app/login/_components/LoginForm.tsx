"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 py-3 text-sm text-[#24382d] outline-none transition placeholder:text-[#929c95] focus:border-[#438260] focus:ring-4 focus:ring-[#438260]/10 disabled:cursor-not-allowed disabled:opacity-60";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setPending(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.ok && !result.error) {
        router.replace("/");
        router.refresh();
        return;
      }

      setError(result?.error === "CredentialsSignin"
        ? "E-mail ou senha inválidos. Confira os dados e tente novamente."
        : "Não foi possível entrar agora. Tente novamente.");
    } catch {
      setError("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" aria-busy={pending}>
      {error && <p role="alert" className="rounded-xl border border-[#edc7bc] bg-[#fff3ef] px-4 py-3 text-sm leading-5 text-[#9e3c2c]">{error}</p>}

      <label htmlFor="login-email" className="block text-sm font-medium text-[#42564a]">
        E-mail
        <input id="login-email" className={inputClass} name="email" type="email" required maxLength={254} autoComplete="email" placeholder="voce@exemplo.com" disabled={pending} />
      </label>

      <label htmlFor="login-password" className="block text-sm font-medium text-[#42564a]">
        Senha
        <input id="login-password" className={inputClass} name="password" type="password" required autoComplete="current-password" disabled={pending} />
      </label>

      <button type="submit" disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#1f4d3a] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#173b2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438260] disabled:cursor-wait disabled:opacity-65">
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="sr-only" aria-live="polite">{pending ? "Autenticando sua conta." : ""}</p>
    </form>
  );
}
