export default function Legend({ showToday = false }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-[3px] border border-purple-500" />
        Haute manifestation
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-[3px] border border-red-500 bg-red-500/20" />
        Bloqué
      </span>
      {showToday && (
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-blue-600" />
          Aujourd’hui
        </span>
      )}
    </div>
  )
}
