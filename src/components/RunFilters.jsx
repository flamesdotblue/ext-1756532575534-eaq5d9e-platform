import { Filter } from 'lucide-react'

export default function RunFilters({ value, onChange }) {
  function update(patch) { onChange({ ...value, ...patch }) }

  return (
    <div className="w-full py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search runs by name, display name, or sweep"
            value={value.q}
            onChange={e => update({ q: e.target.value })}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 pl-9 pr-3 py-2 text-sm outline-none focus:border-neutral-700"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <select
          value={value.status}
          onChange={e => update({ status: e.target.value })}
          className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-700"
        >
          <option value="all">All</option>
          <option value="running">Running</option>
          <option value="finished">Finished</option>
          <option value="failed">Failed</option>
          <option value="crashed">Crashed</option>
          <option value="queued">Queued</option>
          <option value="preempted">Preempted</option>
        </select>
      </div>
    </div>
  )
}
