import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";

export const metadata: Metadata = {
  title: "Үйрен — учим казахский легко",
  description: "Бесплатное приложение для детей: карточки и тесты по казахскому языку",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-[var(--bg)] text-[var(--ink)] antialiased">
        <UserProvider>
          <div className="mx-auto min-h-screen max-w-[480px] bg-[var(--bg)] pb-24 relative">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
