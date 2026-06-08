// Temporary debug view — remove once replay UI is built.

export function ReplayEventJsonDump({ data }: { data: unknown }) {
  return (
    <div className="h-[25vh] w-full shrink-0 overflow-auto text-xs">
      <pre className="m-0">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
