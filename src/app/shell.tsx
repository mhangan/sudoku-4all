import { NavLink, Outlet } from 'react-router-dom'

const linkBase = 'rounded-md px-3 py-2 text-sm font-medium'

export function AppShell() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl p-4 sm:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Sudoku 4 All</h1>
        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-800'}`
            }
          >
            Game
          </NavLink>
          <NavLink
            to="/best-games"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-800'}`
            }
          >
            Best Games
          </NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
