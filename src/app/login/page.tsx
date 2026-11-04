"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Senha incorreta. Tenta de novo.");
        setLoading(false);
        return;
      }
      const next = searchParams.get("next") || "/";
      router.replace(next);
      router.refresh();
    } catch {
      setError("Erro ao entrar. Verifique sua conexão.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border border-border rounded-[var(--radius-lg)] p-8 shadow-sm"
      >
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center text-accent">
            <Lock size={24} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Minha Dieta</h1>
          <p className="text-sm text-foreground-muted">
            Digite seu PIN de acesso
          </p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••"
          className="w-full text-center text-2xl tracking-[0.4em] bg-surface-muted border border-border rounded-[var(--radius-md)] py-4 px-4 outline-none focus:border-accent transition-colors"
        />

        {error && (
          <p className="text-sm text-danger text-center mt-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full mt-6 bg-accent text-[var(--accent-contrast)] font-medium rounded-[var(--radius-md)] py-3.5 disabled:opacity-50 transition-opacity active:scale-[0.98]"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
