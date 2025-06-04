
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

export const metadata: Metadata = {
  title: '喵喵提示詞產生器',
  description: '輕鬆打造你的完美提示詞！',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
    icons: {
    icon: './images/favicon.png',
    shortcut: './images/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '喵喵提示詞產生器'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
