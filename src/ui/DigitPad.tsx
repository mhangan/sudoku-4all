const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

interface DigitPadProps {
  heldDigit: number | null
  digitCounts: number[]
  onDigitClick: (digit: number) => void
  onErase: () => void
}

export function DigitPad({ heldDigit, digitCounts, onDigitClick, onErase }: DigitPadProps) {
  return (
    <aside className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Digit Pad</h3>
      <div className="grid grid-cols-3 gap-2">
        {digits.map((digit) => (
          (() => {
            const count = digitCounts[digit] ?? 0
            const isComplete = count >= 9

            return (
              <button
                key={digit}
                type="button"
                onClick={() => onDigitClick(digit)}
                disabled={isComplete}
                className={`relative rounded-md border px-3 py-2 text-sm font-medium ${
                  isComplete
                    ? 'border-slate-300 bg-slate-200 text-slate-500'
                    : heldDigit === digit
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span>{digit}</span>
                <span
                  aria-label={`Count ${digit}`}
                  className="absolute right-1 top-1 text-[10px] font-semibold leading-none opacity-75"
                >
                  {count}
                </span>
              </button>
            )
          })()
        ))}
      </div>
      <button
        type="button"
        onClick={onErase}
        className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Erase
      </button>
    </aside>
  )
}
