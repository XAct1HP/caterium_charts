import * as React from "react"

export function useJson(path) {
  const [data, setData] = React.useState(null)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setError(null)
        const res = await fetch(path, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (alive) setData(json)
      } catch (e) {
        if (alive) {
          setError(e?.message || String(e))
          setData([])
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [path])

  return { data, error }
}
