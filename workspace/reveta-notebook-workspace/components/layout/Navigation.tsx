'use client'
import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── TOP NAVIGATION ──────────────────────────────────────────────────────────

interface TopNavProps {
  actions?: ReactNode
}

export function TopNav({ actions }: TopNavProps) {
  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 h-14',
        'z-sticky surface-hover',
        'flex items-center px-reveta-5 gap-reveta-4',
        'border-b border-border-default',
      ].join(' ')}
    >
      <Link href="/dashboard" className="flex items-center gap-2 group" aria-label="Reveta Notebook home">
        {/* Logo mark */}
        <div className="w-7 h-7 rounded-component bg-primary-400 flex items-center justify-center relative overflow-hidden">
          <div className="reveta-ambient-orb reveta-ambient-orb--primary absolute inset-0 opacity-40" aria-hidden="true" />
          <span className="relative text-neutral-50 text-t-09 font-display font-bold tracking-widest">R</span>
        </div>
        <span className="reveta-label text-text-primary group-hover:text-primary-200 transition-colors duration-quick">
          Reveta
        </span>
      </Link>

      <div className="flex-1" />

      {actions && (
        <div className="flex items-center gap-reveta-2">
          {actions}
        </div>
      )}
    </header>
  )
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

interface SidebarItemProps {
  href: string
  icon: ReactNode
  label: string
  badge?: string | number
}

export function SidebarItem({ href, icon, label, badge }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-reveta-3 px-reveta-3 py-reveta-2 rounded-component',
        'reveta-caption font-medium transition-colors duration-quick',
        isActive
          ? 'surface-brand-border bg-primary-800 text-primary-200'
          : 'text-text-secondary hover:text-text-primary hover:bg-neutral-850',
      ].join(' ')}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="w-4 h-4 shrink-0" aria-hidden="true">{icon}</span>
      <span>{label}</span>
      {badge !== undefined && (
        <span className="ml-auto reveta-label text-text-secondary bg-neutral-800 rounded-full px-reveta-2 py-0.5 min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </Link>
  )
}

// ─── MAIN LAYOUT SHELL ──────────────────────────────────────────────────────────

export function AppShell({ sidebar, children }: { sidebar?: ReactNode, children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex flex-1 pt-14">
        {sidebar && (
          <aside
            className={[
              'hidden md:flex flex-col w-56 shrink-0',
              'fixed top-14 left-0 bottom-0 overflow-y-auto',
              'surface-ground border-r border-border-default',
              'px-reveta-2 py-reveta-4 gap-reveta-1 z-content',
            ].join(' ')}
            aria-label="Main navigation"
          >
            {sidebar}
          </aside>
        )}
        <main
          className={[
            'flex-1 min-h-full overflow-auto',
            sidebar ? 'md:ml-56' : '',
          ].join(' ')}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
