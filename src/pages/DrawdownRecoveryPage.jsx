// src/pages/DrawdownRecoveryPage.jsx
import React, { useMemo } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { useJson } from "../lib/useJson"

export default function DrawdownRecoveryPage() {
  const { data, error } = useJson("/drawdown_recovery.json")

  // Turn events into drawdown buckets (bar chart needs categories)
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null

    // Bucket size in percentage points (2% buckets: 0–2, 2–4, ...).
    const bucketPct = 2

    // Parse events
    const events = data
      .map((d) => {
        const drawdown = Number(d.drawdown) // negative fraction (e.g. -0.083)
        const recoveryDays = Number(d.recovery_days)
        if (!Number.isFinite(drawdown) || !Number.isFinite(recoveryDays)) return null
        return { drawdown, recoveryDays }
      })
      .filter(Boolean)

    if (events.length === 0) return null

    // Group into buckets by absolute drawdown percent
    const buckets = new Map()

    for (const e of events) {
      const ddAbsPct = Math.abs(e.drawdown) * 100 // e.g. 8.3
      const lo = Math.floor(ddAbsPct / bucketPct) * bucketPct
      const hi = lo + bucketPct

      // 0–2% bucket is fine, but most drawdowns start >0; keep it anyway.
      const key = `${lo}-${hi}`
      if (!buckets.has(key)) buckets.set(key, { lo, hi, values: [] })
      buckets.get(key).values.push(e.recoveryDays)
    }

    // Helper: median
    const median = (arr) => {
      const a = [...arr].sort((x, y) => x - y)
      const mid = Math.floor(a.length / 2)
      return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2
    }

    // Build chart rows (sorted by bucket)
    const rows = [...buckets.values()]
      .sort((a, b) => a.lo - b.lo)
      .map((b) => ({
        bucket: `${b.lo}–${b.hi}%`,
        median_recovery_days: Number(median(b.values).toFixed(1)),
        count: b.values.length,
      }))

    return rows
  }, [data])

  return (
    <div style={wrap}>
      {!chartData ? (
        <div style={loading}>
          {error ? `Data error: ${error}` : "Loading…"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 18, right: 18, bottom: 28, left: 18 }}>
            <CartesianGrid stroke="#151515" vertical={false} />

            <XAxis
              dataKey="bucket"
              tick={tick}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={tick}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Math.round(v)}d`}
            />

            <Tooltip
              contentStyle={tooltip}
              labelStyle={tooltipLabel}
              itemStyle={tooltipItem}
              formatter={(value, name, props) => {
                if (name === "median_recovery_days") {
                  return [`${value}d`, "Median Recovery"]
                }
                return [value, name]
              }}
              labelFormatter={(label) => `Drawdown Bucket: ${label}`}
            />

            <Bar
              dataKey="median_recovery_days"
              fill={GOLD}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const GOLD = "#C9A24D"

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

// Tooltip: black box, GOLD text (as requested)
const tooltip = {
  backgroundColor: "#0B0B0B",
  border: "1px solid #222",
  color: GOLD,
  fontSize: 12,
}
const tooltipLabel = { color: GOLD }
const tooltipItem = { color: GOLD }
