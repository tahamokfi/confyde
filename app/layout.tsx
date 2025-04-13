import '../styles/globals.css';
import type { Metadata } from 'next';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Confyde - Drug Discovery Research',
  description: 'A platform for managing drug discovery research projects and simulating clinical trial scenarios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
} 