import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProjectLog - Build in Public Platform',
  description: 'Document your indie hacker journey and connect with fellow builders',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
