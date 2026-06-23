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
    <header className="flex items-center justify-between px-[18px] pt-[18px] pb-[10px]">
      <div className="flex items-center gap-2 text-[22px] font-extrabold text-[var(--accent-dark)]">
        <span className="text-[28px]">🐻</span> Үйрен
      </div>
      <button
        onClick={handleAuthClick}
        className={`rounded-[14px] border-2 px-3 py-2 text-[13px] font-bold ${
          user?.role === "ADMIN"
            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
            : "border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)]"
        }`}
      >
        {user ? (user.role === "ADMIN" ? "👤 Админ" : `👋 ${user.name}`) : "🔒 Вход"}
      </button>
    </header>
  );
}
