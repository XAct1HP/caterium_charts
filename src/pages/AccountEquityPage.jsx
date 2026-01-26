import React from "react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { useJson } from "../lib/useJson"

export default function AccountEquityPage() {
  const { data, error } = useJson("/equity_chart_data.json")

  return (
    <div style={wrap}>
      {!data ? <div style={loading}>Loading…</div> : (
        <>
          {error ? <div style={err}>Data error: {error}</div> : null}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" />

              {/* Equity axis (left) */}
              <YAxis
                yAxisId="equity"
                tick={tick}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtMoney}
              />

              {/* Drawdown axis (right) — hidden, used for scaling */}
              <YAxis
                yAxisId="dd"
                orientation="right"
                hide
                domain={["auto", 0]}
              />

              <Tooltip
                contentStyle={tooltip}
                labelStyle={{ color: "#AAA" }}
                formatter={(value, name) => {
                  if (name === "equity") return [fmtMoney(value), "Equity"]
                  if (name === "drawdown") return [fmtPct(value), "Drawdown"]
                  return [value, name]
                }}
              />

              <Line
                type="monotone"
                dataKey="equity"
                yAxisId="equity"
                stroke="#C9A24D"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="drawdown"
                yAxisId="dd"
                stroke="#B22222"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
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
const tooltip = { backgroundColor: "#0B0B0B", border: "1px solid #222", color: "#E6E6E6", fontSize: 12 }

function fmtMoney(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return v
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

function fmtPct(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return v
  return `${(n * 100).toFixed(2)}%`
}
