import { ChefHat } from 'lucide-react'
import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
  headerContent?: ReactNode
}

export function AppShell({ children, headerContent }: AppShellProps) {
  return (
    <main className="app-shell">
      <div className="spotlight spotlight-left" />
      <div className="spotlight spotlight-right" />

      <header className="topbar">
        <a className="brand" href="/" aria-label="mise home">
          <span className="brand-mark"><ChefHat size={14} strokeWidth={2.5} /></span>
          <span>mise</span>
        </a>
        {headerContent}
        <div className="topbar-status"><span className="status-dot" /> recipe lab</div>
      </header>

      {children}

      <footer className="app-footer">
        <span>made for curious cooks</span>
        <span className="footer-rule" />
        <span>v0.1 / private kitchen</span>
      </footer>
    </main>
  )
}
