// src/pages/RiskReturnPage.jsx
import React, { useMemo } from "react"
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { useJson } from "../lib/useJson"

export default function RiskReturnPage() {
  const { data, error } = useJson("/equity_chart_data.json")

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null

    // Base equity for normalized return
    const base = Number(data[0]?.equity ?? data[0]?.account_equity ?? 1) || 1

    // Build points: X=drawdown, Y=return
    return data
      .map((d) => {
        const equity = Number(d.equity ?? d.account_equity)
        const dd = Number(d.drawdown)
        if (!Number.isFinite(equity) || !Number.isFinite(dd)) return null

        return {
          drawdown: dd, // negative values (0 at peak)
          return: (equity - base) / base, // normalized return from start
        }
      })
      .filter(Boolean)
  }, [data])

  return (
    <div style={wrap}>
      {!chartData ? (
        <div style={loading}>
          {error ? `Data error: ${error}` : "Loading…"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 18, right: 18, bottom: 18, left: 18 }}>
            <CartesianGrid stroke="#151515" vertical={false} />

            {/* X = Drawdown */}
            <XAxis
              dataKey="drawdown"
              type="number"
              domain={["auto", 0]}
              tick={tick}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtPct0}
            />

            {/* Y = Return */}
            <YAxis
              dataKey="return"
              type="number"
              domain={["auto", "auto"]}
              tick={tick}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtPct0}
            />

            {/* Reference lines at 0 */}
            <ReferenceLine x={0} stroke="#222" />
            <ReferenceLine y={0} stroke="#222" />

            <Tooltip
              contentStyle={tooltip}
              labelStyle={{ color: "#AAA" }}
              formatter={(value, name) => {
                if (name === "drawdown") return [fmtPct2(value), "Drawdown"]
                if (name === "return") return [fmtPct2(value), "Return"]
                return [value, name]
              }}
            />

            {/* Envelope cloud (points) */}
            <Scatter
              data={chartData}
              fill="#C9A24D"
              opacity={0.75}
              // Small points, no labels
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
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
const tick = { fill: "#777", fontSize: 12 }
const tooltip = {
  backgroundColor: "#0B0B0B",
  border: "1px solid #222",
  color: "#E6E6E6",
  fontSize: 12,
}

function fmtPct0(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return v
  return `${(n * 100).toFixed(0)}%`
}

function fmtPct2(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return v
  return `${(n * 100).toFixed(2)}%`
}
