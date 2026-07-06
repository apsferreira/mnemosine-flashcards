import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',       label: 'Dashboard', ariaLabel: 'Ir para Dashboard' },
  { to: '/decks',  label: 'Decks',     ariaLabel: 'Ir para lista de Decks' },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top nav — mobile-first */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
            Mnemosine
          </span>
          <nav aria-label="Navegação principal">
            <ul className="flex gap-1" role="list">
              {NAV_ITEMS.map(({ to, label, ariaLabel }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    aria-label={ariaLabel}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
