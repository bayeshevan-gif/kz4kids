import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";

const nunito = Nunito({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

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
    <html lang="ru" className={nunito.variable}>
      <body className="bg-[var(--bg)] text-[var(--ink)] font-sans antialiased">
        <UserProvider>
          <div className="mx-auto min-h-screen max-w-[480px] bg-[var(--bg)] pb-24 relative">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
