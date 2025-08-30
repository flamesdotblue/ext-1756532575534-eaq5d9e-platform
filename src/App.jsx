import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import SettingsPanel from './components/SettingsPanel'
import RunFilters from './components/RunFilters'
import RunList from './components/RunList'
import { fetchRuns, generateMockRuns, tickMockRuns } from './lib/wandb'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('wb_settings')
    return (
      saved ? JSON.parse(saved) : {
        apiKey: '',
        entity: '',
        project: '',
        perPage: 50,
        pollInterval: 20,
        demoMode: true,
      }
    )
  })

  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: 'all', q: '' })
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    localStorage.setItem('wb_settings', JSON.stringify(settings))
  }, [settings])

  async function loadRuns({ silent = false } = {}) {
    if (!silent) setLoading(true)
    setError('')

    try {
      if (settings.demoMode || !settings.apiKey || !settings.entity || !settings.project) {
        setRuns(prev => prev.length ? tickMockRuns(prev) : generateMockRuns())
      } else {
        const data = await fetchRuns({
          apiKey: settings.apiKey,
          entity: settings.entity,
          project: settings.project,
          perPage: settings.perPage || 50,
        })
        setRuns(data)
      }
      setLastUpdated(new Date())
    } catch (e) {
      setError(e?.message || 'Failed to fetch runs')
      // Fallback to demo to keep app useful
      setRuns(prev => prev.length ? tickMockRuns(prev) : generateMockRuns())
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    // initial load
    loadRuns()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.demoMode, settings.entity, settings.project])

  useEffect(() => {
    const intervalSec = Math.max(5, Number(settings.pollInterval || 20))
    const id = setInterval(() => {
      loadRuns({ silent: true })
    }, intervalSec * 1000)
    return () => clearInterval(id)
  }, [settings.pollInterval, settings.demoMode, settings.apiKey, settings.entity, settings.project])

  const filteredRuns = useMemo(() => {
    let list = runs
    if (filters.status !== 'all') {
      list = list.filter(r => (r.state || '').toLowerCase() === filters.status)
    }
    if (filters.q) {
      const q = filters.q.toLowerCase()
      list = list.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.displayName || '').toLowerCase().includes(q) ||
        (r.sweepName || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [runs, filters])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        onRefresh={() => loadRuns()}
        loading={loading}
        lastUpdated={lastUpdated}
        demoMode={settings.demoMode}
      />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        <div className="sticky top-0 z-10 -mx-4 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 px-4 pt-2">
          <RunFilters value={filters} onChange={setFilters} />
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <RunList
          runs={filteredRuns}
          onRefresh={() => loadRuns()}
          loading={loading}
        />
      </main>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        value={settings}
        onChange={setSettings}
      />
    </div>
  )
}
