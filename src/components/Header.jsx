import { RefreshCw, Settings, Wand2 } from 'lucide-react'

export default function Header({ onOpenSettings, onRefresh, loading, lastUpdated, demoMode }) {
  return (
    <header className="sticky top-0 z-20 w-full bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight">W&B Mobile Dashboard</div>
            <div className="text-xs text-neutral-400">
              {demoMode ? 'Demo mode' : lastUpdated ? `Updated ${timeAgo(lastUpdated)}` : '—'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-2 text-sm font-medium hover:bg-neutral-700 active:scale-[0.98] border border-neutral-700/50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-2 text-sm font-medium hover:bg-neutral-700 active:scale-[0.98] border border-neutral-700/50"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>
    </header>
  )
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
