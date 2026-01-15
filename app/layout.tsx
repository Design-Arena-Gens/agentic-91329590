import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Daily Goal Tracker',
  description: 'Track your daily, monthly, and yearly goals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
