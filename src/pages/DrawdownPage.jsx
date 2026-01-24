import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts"
import { useJson } from "../lib/useJson"

function formatPct(x) {
  if (x == null || Number.isNaN(x)) return ""
  return `${(x * 100).toFixed(2)}%`
}

export default function DrawdownPage() {
  const { data, error } = useJson("/drawdown.json")

  const maxDD = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null
    let best = null
    for (const d of data) {
      if (!d || typeof d.drawdown !== "number" || !d.date) continue
      if (!best || d.drawdown < best.drawdown) best = d // most negative
    }
    return best
  }, [data])

  return (
    <div style={wrap}>
      {!data ? (
        <div style={loading}>Loading…</div>
      ) : (
        <>
          {error ? <div style={err}>Data error: {error}</div> : null}

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="date" hide />
              <YAxis
                tick={tick}
                axisLine={false}
                tickLine={false}
                domain={["auto", 0]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={tooltip}
                labelStyle={{ color: "#AAA" }}
                formatter={(v) => [formatPct(v), "Drawdown"]}
              />

              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#D94B4B"
                fill="#D94B4B"
                fillOpacity={0.22}
                strokeWidth={2}
                dot={false}
              />

              {maxDD ? (
                <ReferenceDot
                  x={maxDD.date}
                  y={maxDD.drawdown}
                  r={6}
                  fill="#D94B4B"
                  stroke="#000"
                  strokeWidth={2}
                  label={{
                    value: "Max Drawdown",
                    position: "bottom",
                    fill: "#E6E6E6",
                    fontSize: 12,
                  }}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}

const wrap = {
  width: "100vw",
  height: "100vh",
  background: "#000",
  padding: 16,
  boxSizing: "border-box",
  fontFamily: "Inter, system-ui, Arial",
}
const loading = { color: "#777", fontSize: 12 }
const err = { color: "#777", fontSize: 12, marginBottom: 8 }
const tick = { fill: "#777", fontSize: 12 }
const tooltip = {
  backgroundColor: "#0B0B0B",
  border: "1px solid #222",
  color: "#E6E6E6",
  fontSize: 12,
}
