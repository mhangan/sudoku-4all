import { useEffect } from 'react'
import { useBestGamesStore } from '../../state/useBestGamesStore'

function formatElapsedTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function BestGamesPage() {
  const records = useBestGamesStore((state) => state.records)
  const recentRecordId = useBestGamesStore((state) => state.recentRecordId)
  const loadRecords = useBestGamesStore((state) => state.loadRecords)
  const clearRecords = useBestGamesStore((state) => state.clearRecords)

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const onClear = (): void => {
    const confirmed = window.confirm('Clear all best game records? This action cannot be undone.')
    if (!confirmed) return
    clearRecords()
  }

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Best Games</h2>
        <button
          type="button"
          onClick={onClear}
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
            <li
              key={record.id}
              className={`rounded border p-2 text-sm ${
                record.id === recentRecordId ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold">#{index + 1}</span>
                <span className="capitalize">{record.difficulty}</span>
                <span>{formatElapsedTime(record.elapsedSeconds)}</span>
                <span>{new Date(record.completedAt).toLocaleString()}</span>
                <span className={record.cheated ? 'text-amber-700' : 'text-emerald-700'}>
                  {record.cheated ? 'cheated' : 'clean'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
