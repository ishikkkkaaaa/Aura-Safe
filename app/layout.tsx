import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aura Safe',
  description: 'Your secure digital companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="p-4 border-b">
          <nav>
            <h1 className="text-2xl font-bold">Aura Safe</h1>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="p-4 border-t">
          <p className="text-center text-gray-600">© 2024 Aura Safe. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
} 