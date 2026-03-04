import { useEffect } from 'react'
import { useBestGamesStore } from '../../state/useBestGamesStore'

export function BestGamesPage() {
  const records = useBestGamesStore((state) => state.records)
  const loadRecords = useBestGamesStore((state) => state.loadRecords)
  const clearRecords = useBestGamesStore((state) => state.clearRecords)

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Best Games</h2>
        <button
          type="button"
          onClick={clearRecords}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-100"
        >
          Clear
        </button>
      </div>
      {records.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No completed games yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {records.map((record, index) => (
            <li key={record.id} className="rounded border border-slate-200 p-2 text-sm">
              #{index + 1} · {record.difficulty} · {record.elapsedSeconds}s · {record.cheated ? 'cheated' : 'clean'}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
