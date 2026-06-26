"use client";
import React from "react";

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function AdminLayout({ sidebar, children }: Props) {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--ink)]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-[280px_1fr] gap-6 items-start py-6">
          <aside className="w-[280px] sticky top-6 h-[calc(100vh-96px)] overflow-y-auto">{sidebar}</aside>
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}
