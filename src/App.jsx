import React, { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const DEFAULT_DATA_URL = "/equity_curve.json"
function useQueryDataUrl() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("data") || DEFAULT_DATA_URL
  }, [])
}

export default function App() {
  const dataUrl = useQueryDataUrl()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetch(dataUrl, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => setData(Array.isArray(json) ? json : []))
      .catch((e) => {
        console.error(e)
        setErr(String(e))
        setData([])
      })
  }, [dataUrl])

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        padding: 16,
        boxSizing: "border-box",
        fontFamily: "Inter, system-ui, Arial",
      }}
    >
      {!data ? (
        <div style={{ color: "#777", fontSize: 12 }}>Loading…</div>
      ) : (
        <>
          {err ? (
            <div style={{ color: "#777", fontSize: 12, marginBottom: 8 }}>
              Data error: {err}
            </div>
          ) : null}

          <div style={{ width: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" hide />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: "#777", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B0B0B",
                    border: "1px solid #222",
                    color: "#E6E6E6",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#AAA" }}
                />
                <Line
                  type="monotone"
                  dataKey="equity_index"
                  stroke="#C9A24D"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
