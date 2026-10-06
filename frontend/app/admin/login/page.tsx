"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { AdminButton, Banner, Field, INPUT } from "@/components/admin/fields";
import { WeaveMark } from "@/components/weave/Weave";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.login(email, password);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reach the server. Check that the API is running.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <WeaveMark size={24} />
          <h1 className="text-[length:var(--text-lg)]">Sign in</h1>
        </div>

        {error ? <Banner tone="error">{error}</Banner> : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Email" htmlFor="email" required>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              className={INPUT}
            />
          </Field>

          <Field label="Password" htmlFor="password" required>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={INPUT}
            />
          </Field>

          <AdminButton type="submit" disabled={busy} className="w-full">
            {busy ? "Signing in…" : "Sign in"}
          </AdminButton>
        </form>
      </div>
    </div>
  );
}
