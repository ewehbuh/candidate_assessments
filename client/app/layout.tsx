import { ReduxProvider } from '@/store/provider';
import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candidate Assessment',
  description: 'Full-stack developer assessment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}