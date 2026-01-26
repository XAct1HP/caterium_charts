// src/pages/DrawdownRecoveryPage.jsx
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

export default function DrawdownRecoveryPage() {
  const { data, error } = useJson("/drawdown_recovery.json")

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return null
    return data
      .map((d) => {
        const drawdown = Number(d.drawdown)
        const recoveryDays = Number(d.recovery_days)
        if (!Number.isFinite(drawdown) || !Number.isFinite(recoveryDays)) return null
        return { drawdown, recoveryDays }
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
          <ScatterChart margin={{ top: 18, right: 18, bottom: 28, left: 18 }}>
            <CartesianGrid stroke="#151515" vertical={false} />

            {/* X = Drawdown depth (negative %) */}
            <XAxis
              dataKey="drawdown"
              type="number"
              domain={["auto", 0]}
              tick={tick}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtPct0}
              label={{ value: "Drawdown", position: "insideBottom", offset: -10, fill: "#777", fontSize: 12 }}
            />

            {/* Y = Days to recover */}
            <YAxis
              dataKey="recoveryDays"
              type="number"
              domain={[0, "auto"]}
              tick={tick}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtDays}
              label={{ value: "Days to Recovery", angle: -90, position: "insideLeft", offset: 6, fill: "#777", fontSize: 12 }}
            />

            {/* Reference lines */}
            <ReferenceLine x={0} stroke="#222" />
            <ReferenceLine y={0} stroke="#222" />

            <Tooltip
              contentStyle={tooltip}
              labelStyle={{ color: "#FFFFFF" }}
              formatter={(value, name) => {
                if (name === "recoveryDays") return [fmtDays(value), "Days to Recovery"]
                if (name === "drawdown") return [fmtPct2(value), "Drawdown"]
                return [value, name]
              }}
              labelFormatter={() => "Event"}
            />

            {/* Points */}
            <Scatter
              data={chartData}
              fill="#C9A24D"
              opacity={0.8}
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
  color: "#FFFFFF",
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

function fmtDays(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return v
  return `${Math.round(n)}d`
}
