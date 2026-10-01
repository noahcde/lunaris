import { Home, CalendarDays } from 'lucide-react'
import { cx } from '../lib/astro'

const NAV_ITEMS = [
  { id: 'accueil', label: 'Accueil', Icon: Home },
  { id: 'calendrier', label: 'Calendrier', Icon: CalendarDays },
]

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md px-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
    >
      <ul className="flex items-center gap-1.5 rounded-2xl border border-zinc-900 bg-zinc-950/90 p-1.5 backdrop-blur-xl">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = id === active
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'flex w-full flex-col items-center gap-1 rounded-xl py-2',
                  'transition-all duration-300 ease-in-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
                  isActive ? 'bg-blue-600/10 text-blue-500' : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                <Icon
                  className={cx(
                    'h-5 w-5 transition-all duration-300 ease-in-out',
                    isActive && 'drop-shadow-[0_0_6px_rgba(37,99,235,0.7)]',
                  )}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
