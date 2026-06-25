"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";

export default function AppHeader() {
  const { user, refresh } = useUser();
  const router = useRouter();

  async function handleAuthClick() {
    if (user) {
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        await fetch("/api/auth/logout", { method: "POST" });
        await refresh();
        router.push("/");
      }
    } else {
      router.push("/login");
    }
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 glass-header">
      <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer select-none">
        <div className="rounded-full w-12 h-12 bg-[var(--accent-soft)] flex items-center justify-center shadow-[0_8px_18px_rgba(255,154,74,0.08)]">
          <span className="text-[28px]">🐻</span>
        </div>
        <div>
          <div className="text-[18px] font-extrabold text-[var(--accent-dark)]">Үйрен</div>
          <div className="text-[11px] text-[var(--ink-soft)]">Учим казахский весело</div>
        </div>
      </div>

      <button
        onClick={handleAuthClick}
        className={`big-cta rounded-[14px] cursor-pointer active:scale-95 transition-transform ${
          user?.role === "ADMIN"
            ? "border-0 bg-[var(--accent)] text-white"
            : "border-2 border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)]"
        }`}
      >
        {user ? (user.role === "ADMIN" ? "👤 Админ" : `👋 ${user.name}`) : "🔒 Вход"}
      </button>
    </header>
  );
}
