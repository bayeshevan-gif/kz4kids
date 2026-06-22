import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Бала Тілі — Изучение казахского языка для детей',
  description: 'Интерактивная адаптивная платформа для геймифицированного обучения детей казахскому языку',
  manifest: '/manifest.json',
  themeColor: '#f59e0b',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}