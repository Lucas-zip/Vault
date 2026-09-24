import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  Target,
  TrendingUp,
  LogOut,
  CalendarClock,
} from 'lucide-react';
import { Logo } from './Logo';
import { initials } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { to: '/accounts', label: 'Contas', icon: Wallet },
  { to: '/categories', label: 'Categorias', icon: Tags },
  { to: '/budgets', label: 'Orçamentos', icon: Target },
  { to: '/investments', label: 'Investimentos', icon: TrendingUp },
  { to: '/recurrences', label: 'Recorrências', icon: CalendarClock },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ===== Sidebar desktop ===== */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-background sticky top-0 h-screen">
        <div className="px-5 pt-5 pb-6">
          <Logo size="md" />
        </div>

        <nav className="flex-1 px-3 space-y-0.5" aria-label="Navegação principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors focus-ring ${
                  isActive
                    ? 'bg-surface-raised text-foreground font-medium'
                    : 'text-muted-fg hover:text-foreground hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    aria-hidden
                    className={`w-[18px] h-[18px] ${
                      isActive ? 'text-accent' : 'text-subtle-fg group-hover:text-muted-fg'
                    }`}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <span className="w-8 h-8 shrink-0 rounded-md bg-surface-raised border border-border text-foreground flex items-center justify-center text-xs font-semibold">
              {user ? initials(user.name) : '?'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-fg truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              aria-label="Sair"
              className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Área principal ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
          <Logo size="sm" />
          {user && (
            <button
              onClick={handleLogout}
              title="Sair"
              aria-label="Sair"
              className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* Navegação mobile */}
        <nav
          className="md:hidden flex gap-1 overflow-x-auto px-4 py-2 bg-background border-b border-border"
          aria-label="Navegação principal"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex h-9 items-center gap-2 rounded-md px-3 text-sm whitespace-nowrap transition-colors focus-ring ${
                  isActive
                    ? 'bg-surface-raised text-foreground font-medium'
                  : 'text-muted-fg hover:text-foreground hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    aria-hidden
                    className={`w-4 h-4 ${
                      isActive ? 'text-accent' : 'text-subtle-fg'
                    }`}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
