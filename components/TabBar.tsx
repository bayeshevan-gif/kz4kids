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
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] flex px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 z-50 glass-tabbar rounded-t-[20px] shadow-[0_-8px_24px_rgba(255,154,74,0.06)]">
      {tabs.map((t) => {
        const active = isActive(t.href);
        return (
          <button
            key={t.key}
            onClick={() => router.push(t.href)}
            className={`flex-1 tab-pill cursor-pointer active:scale-95 transition-transform text-[12px] ${active ? 'tab-active' : ''}`}
          >
            <span className="text-[24px]">{t.icon}</span>
            <div className="text-[12px] font-extrabold">{t.label}</div>
          </button>
        );
      })}
    </nav>
  );
}
