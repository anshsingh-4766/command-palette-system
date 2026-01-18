import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Command Palette - Global Search & Command Execution',
  description: 'A keyboard-first command palette with deterministic fuzzy search, plugin architecture, and parameterized commands. Built from scratch with full accessibility support.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
