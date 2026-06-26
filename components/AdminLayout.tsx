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
        <div className="grid min-w-0 grid-cols-[340px_minmax(0,1fr)] gap-8 items-start">
          <aside className="min-w-0">{sidebar}</aside>
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}
