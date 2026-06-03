import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppShell } from './components/AppShell'
import '../index.css'

export const metadata: Metadata = {
  title: 'AthsVic Insights',
  description: 'Athletics Victoria insights and analytics',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
