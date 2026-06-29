"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function establishSession() {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("No ID token");
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session creation failed");
    router.push(searchParams.get("next") ?? "/");
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await establishSession();
    } catch {
      setError("Daxil olmaq mümkün olmadı / Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await establishSession();
    } catch {
      setError("Daxil olmaq mümkün olmadı / Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus-visible:border-accent"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus-visible:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "..." : "Sign in"}
        </button>
      </form>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="rounded-full border border-border px-4 py-2 font-semibold disabled:opacity-50"
      >
        Continue with Google
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
