import { CheckCircle, Clock, PauseCircle, PlayCircle, RefreshCw, XCircle } from 'lucide-react'

export default function RunList({ runs, onRefresh, loading }) {
  if (!runs?.length) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center text-center gap-3 text-neutral-400">
        <div className="h-10 w-10 rounded-full border border-neutral-800 flex items-center justify-center">
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </div>
        <div className="text-sm">No runs to display yet</div>
        <button onClick={onRefresh} className="text-xs underline hover:text-neutral-200">Refresh</button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
      {runs.map(run => (
        <RunCard key={run.id || run.name} run={run} />
      ))}
    </div>
  )
}

function RunCard({ run }) {
  const metrics = run.metrics || {}
  const progress = computeProgress(metrics)
  const status = (run.state || '').toLowerCase()
  const statusInfo = getStatusInfo(status)

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{run.displayName || run.name}</div>
          <div className="truncate text-[11px] text-neutral-400">{run.sweepName || run.id}</div>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${statusInfo.bg} ${statusInfo.text}`}>
          {statusInfo.icon}
          <span className="capitalize">{status || 'unknown'}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div className={`h-full ${progress.color}`} style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
          <span>{progress.label}</span>
          <span>{shortTime(run.updatedAt || run.createdAt)}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        {pickMetric(metrics, ['train/loss','loss','train_loss'])}
        {pickMetric(metrics, ['val/loss','validation/loss','val_loss'])}
        {pickMetric(metrics, ['accuracy','acc','val/accuracy','eval/accuracy'])}
      </div>
    </div>
  )
}

function pickMetric(metrics, keys) {
  const key = keys.find(k => metrics[k] !== undefined)
  if (!key) return <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 text-neutral-500">—</div>
  const val = metrics[key]
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
      <div className="text-neutral-400">{key}</div>
      <div className="font-mono">{fmt(val)}</div>
    </div>
  )
}

function fmt(n) {
  if (n === null || n === undefined) return '—'
  if (typeof n === 'number') {
    if (Math.abs(n) >= 1000) return n.toFixed(0)
    if (Math.abs(n) >= 100) return n.toFixed(1)
    if (Math.abs(n) >= 1) return n.toFixed(3)
    return n.toExponential(2)
  }
  return String(n)
}

function computeProgress(m) {
  const step = m.global_step ?? m._step ?? m.step ?? 0
  const max = m.max_steps ?? m.total_steps ?? m.training_steps ?? null
  const epoch = m.epoch ?? m.current_epoch
  const maxEpochs = m.max_epochs ?? m.epochs
  let percent = 0
  let label = 'Progress unknown'
  if (max) {
    percent = clamp((step / max) * 100, 0, 100)
    label = `Step ${step} / ${max}`
  } else if (maxEpochs) {
    percent = clamp(((epoch || 0) / maxEpochs) * 100, 0, 100)
    label = `Epoch ${epoch ?? 0} / ${maxEpochs}`
  } else if (step) {
    percent = 15 + (Math.min(step, 1000) / 1000) * 70
    label = `Step ${step}`
  }

  let color = 'bg-indigo-500'
  if (percent > 90) color = 'bg-emerald-500'
  else if (percent > 50) color = 'bg-blue-500'

  return { percent, label, color }
}

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)) }

function shortTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getStatusInfo(status) {
  switch (status) {
    case 'running':
      return { icon: <PlayCircle className="h-3.5 w-3.5" />, bg: 'bg-blue-500/10', text: 'text-blue-300' }
    case 'finished':
      return { icon: <CheckCircle className="h-3.5 w-3.5" />, bg: 'bg-emerald-500/10', text: 'text-emerald-300' }
    case 'failed':
    case 'crashed':
      return { icon: <XCircle className="h-3.5 w-3.5" />, bg: 'bg-rose-500/10', text: 'text-rose-300' }
    case 'queued':
      return { icon: <Clock className="h-3.5 w-3.5" />, bg: 'bg-neutral-500/10', text: 'text-neutral-300' }
    case 'preempted':
      return { icon: <PauseCircle className="h-3.5 w-3.5" />, bg: 'bg-amber-500/10', text: 'text-amber-300' }
    default:
      return { icon: <Clock className="h-3.5 w-3.5" />, bg: 'bg-neutral-500/10', text: 'text-neutral-300' }
  }
}
