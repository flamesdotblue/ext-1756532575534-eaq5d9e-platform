import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function SettingsPanel({ open, onClose, value, onChange }) {
  const ref = useRef(null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function update(patch) {
    onChange({ ...value, ...patch })
  }

  return (
    <div
      className={`fixed inset-0 z-30 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        ref={ref}
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-2xl border border-neutral-800 bg-neutral-900 shadow-xl transition-transform ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="text-base font-semibold">Settings</div>
            <div className="text-xs text-neutral-400">Configure W&B access and refresh interval</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-neutral-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-neutral-300">W&B API Key</span>
              <input
                type="password"
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                placeholder="Paste your API key"
                value={value.apiKey}
                onChange={e => update({ apiKey: e.target.value })}
                autoComplete="off"
              />
              <span className="text-xs text-neutral-500">Stored locally in your browser</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-300">Entity</span>
                <input
                  type="text"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                  placeholder="your-username-or-org"
                  value={value.entity}
                  onChange={e => update({ entity: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-300">Project</span>
                <input
                  type="text"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                  placeholder="project-name"
                  value={value.project}
                  onChange={e => update({ project: e.target.value })}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-300">Per Page</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                  value={value.perPage}
                  onChange={e => update({ perPage: Number(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-300">Poll Interval (s)</span>
                <input
                  type="number"
                  min={5}
                  max={300}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
                  value={value.pollInterval}
                  onChange={e => update({ pollInterval: Number(e.target.value) })}
                />
              </label>
              <label className="flex items-center gap-2 mt-6 select-none">
                <input
                  type="checkbox"
                  checked={!!value.demoMode}
                  onChange={e => update({ demoMode: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-indigo-500"
                />
                <span className="text-sm text-neutral-300">Demo mode</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
