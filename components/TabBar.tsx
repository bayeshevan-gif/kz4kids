"use client";

import { useRouter, usePathname } from "next/navigation";

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { key: "home", label: "Карточки", icon: "📒", href: "/" },
    { key: "tests", label: "Тесты", icon: "📝", href: "/test" },
    { key: "profile", label: "Профиль", icon: "🏆", href: "/profile" },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/" || pathname.startsWith("/learn");
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] flex border-t border-[var(--line)] bg-[var(--card)] px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 z-50">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => router.push(t.href)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-bold ${
            isActive(t.href) ? "text-[var(--accent-dark)]" : "text-[var(--ink-soft)]"
          }`}
        >
          <span className="text-[22px]">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
