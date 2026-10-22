import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { MocProvider } from '@/context/MocContext';

export const metadata: Metadata = {
  title: '产品工程变更管理系统 (MOC) | 制造运营与质量协同平台',
  description: 'Enterprise Product Management of Change System based on Next.js, TypeScript & Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <MocProvider>
            {children}
          </MocProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
