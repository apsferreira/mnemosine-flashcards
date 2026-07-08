import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mnemosine — Flashcards',
  description: 'Spaced repetition powered by FSRS-6. Open-source alternative to Anki iOS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geist.className} min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40`}
      >
        <Providers>
          <main className="max-w-2xl mx-auto px-4 py-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
