import type { ReactNode } from 'react'
import { ThemeSwitcher } from '../theme/ThemeSwitcher'

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
          <span><img src="/favicon.svg" alt="mise logo" width={24} height={24} /></span>
          <span>mise.</span>
        </a>
        {headerContent}
        <div className="header-actions">
          <div className="topbar-status"><span className="status-dot" /> recipe lab</div>
          <ThemeSwitcher />
        </div>
      </header>

      {children}

      <footer className="app-footer">
        <span><img src="/favicon.svg" alt="mise logo" width={18} height={18} /></span>
        <span className="footer-rule" />
        <span>made for curious cooks</span>
      </footer>
    </main>
  )
}
