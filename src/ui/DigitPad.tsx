const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

interface DigitPadProps {
  heldDigit: number | null
  onDigitClick: (digit: number) => void
  onErase: () => void
}

export function DigitPad({ heldDigit, onDigitClick, onErase }: DigitPadProps) {
  return (
    <aside className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Digit Pad</h3>
      <div className="grid grid-cols-3 gap-2">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onDigitClick(digit)}
            className={`rounded-md border px-3 py-2 text-sm font-medium ${
              heldDigit === digit
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {digit}
          </button>
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
