"use client";
import React from "react";

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function AdminLayout({ sidebar, children }: Props) {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--ink)]">
      <div className="w-full max-w-[1600px] mx-auto px-8 py-8">
        <div className="grid grid-cols-[320px_1fr] gap-8 items-start">
          <aside className="w-[320px] sticky top-8 h-[calc(100vh-96px)] overflow-y-auto">{sidebar}</aside>
          <section className="min-w-0 break-normal whitespace-normal">{children}</section>
        </div>
      </div>
    </div>
  );
}
