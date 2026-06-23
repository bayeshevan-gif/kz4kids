"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        return;
      }
      await refresh();
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-[30px] text-center">
      <span className="text-[60px] mb-2">🌟</span>
      <h1 className="text-[24px] font-extrabold mb-1">Создать аккаунт</h1>
      <p className="text-[var(--ink-soft)] mb-6 text-[14px]">Это займёт 10 секунд</p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <input
          type="text"
          placeholder="Придумай имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[12px] border-2 border-[var(--line)] bg-white px-3 py-3 text-[15px]"
        />
        <input
          type="password"
          placeholder="Придумай пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-[12px] border-2 border-[var(--line)] bg-white px-3 py-3 text-[15px]"
        />
        {error && <p className="text-[var(--bad)] text-[13px] font-semibold">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[14px] bg-[var(--accent)] text-white font-extrabold py-[13px] text-[15px] disabled:opacity-60"
        >
          {submitting ? "Создаём..." : "Зарегистрироваться"}
        </button>
      </form>

      <button
        onClick={() => router.push("/login")}
        className="mt-4 text-[14px] font-bold text-[var(--accent-dark)]"
      >
        Уже есть аккаунт? Войти
      </button>
    </main>
  );
}
