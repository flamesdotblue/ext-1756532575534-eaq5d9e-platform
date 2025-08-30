// Lightweight W&B client for browser. GraphQL may be blocked by CORS in some contexts; we provide
// a graceful fallback to demo/mock data so the UI remains functional.

export async function fetchRuns({ apiKey, entity, project, perPage = 50 }) {
  if (!apiKey || !entity || !project) throw new Error('Missing API credentials/settings')

  const query = `
    query ProjectRuns($entity: String!, $project: String!, $first: Int) {
      project(name: $project, entityName: $entity) {
        runs(first: $first, order: "-created_at") {
          edges {
            node {
              id
              name
              displayName
              state
              sweepName
              createdAt
              updatedAt
              summaryMetrics
              historyTail(k: 1)
            }
          }
        }
      }
    }
  `

  const res = await fetch('https://api.wandb.ai/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables: { entity, project, first: perPage } }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`W&B API error: ${res.status} ${text}`)
  }

  const json = await res.json()
  if (json.errors) throw new Error(json.errors?.[0]?.message || 'GraphQL error')

  const edges = json?.data?.project?.runs?.edges || []
  const runs = edges.map(e => normalizeRun(e.node))
  return runs
}

function normalizeRun(node) {
  const tail = parseHistoryTail(node.historyTail)
  const metrics = { ...(node.summaryMetrics || {}), ...tail }
  return {
    id: node.id,
    name: node.name,
    displayName: node.displayName,
    state: node.state,
    sweepName: node.sweepName,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    metrics,
  }
}

function parseHistoryTail(tail) {
  // The API returns an array of dicts or a dict; handle common cases.
  // If it's a list of rows, merge last row; if it's already key/val, return as-is.
  if (!tail) return {}
  if (Array.isArray(tail) && tail.length) {
    const last = tail[tail.length - 1]
    if (last && typeof last === 'object') return last
  }
  if (typeof tail === 'object') return tail
  return {}
}

// Demo/Mock data utilities
export function generateMockRuns(n = 9) {
  const states = ['running','running','finished','running','failed','queued','running','finished','running']
  const now = Date.now()
  return Array.from({ length: n }).map((_, i) => {
    const s = states[i % states.length]
    const max = 2000 + Math.floor(Math.random() * 4000)
    const step = s === 'finished' ? max : Math.floor(Math.random() * Math.min(1600, max))
    return {
      id: `demo-${i}-${Math.random().toString(36).slice(2,7)}`,
      name: `run-${i + 1}`,
      displayName: `Experiment ${i + 1}`,
      state: s,
      sweepName: Math.random() > 0.6 ? `sweep-${(i%3)+1}` : undefined,
      createdAt: new Date(now - Math.random() * 36e5).toISOString(),
      updatedAt: new Date(now - Math.random() * 12e5).toISOString(),
      metrics: {
        global_step: step,
        max_steps: max,
        epoch: Math.floor(step / 200),
        max_epochs: Math.floor(max / 200),
        'train/loss': +(Math.random() * 2 + 0.1).toFixed(3),
        'val/loss': +(Math.random() * 2 + 0.1).toFixed(3),
        accuracy: +(Math.random() * 0.4 + 0.5).toFixed(3),
      },
    }
  })
}

export function tickMockRuns(prev) {
  return prev.map(r => {
    if (r.state !== 'running') return r
    const max = r.metrics.max_steps || r.metrics.total_steps || 4000
    const inc = Math.floor(Math.random() * 120)
    const next = Math.min(max, (r.metrics.global_step || r.metrics._step || 0) + inc)
    const finished = next >= max && Math.random() > 0.4
    return {
      ...r,
      state: finished ? 'finished' : r.state,
      updatedAt: new Date().toISOString(),
      metrics: {
        ...r.metrics,
        global_step: next,
        epoch: (r.metrics.epoch || 0) + (Math.random() > 0.7 ? 1 : 0),
        'train/loss': Math.max(0.01, (r.metrics['train/loss'] || 1.2) * (0.95 + Math.random() * 0.05)),
        'val/loss': Math.max(0.01, (r.metrics['val/loss'] || 1.1) * (0.96 + Math.random() * 0.06)),
        accuracy: Math.min(0.999, (r.metrics.accuracy || 0.6) * (1.001 + Math.random() * 0.01)),
      },
    }
  })
}
