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

  // Build a histogram: X = recovery-days buckets, Y = count of drawdowns
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null

    // Bucket size in days (edit this to 5, 10, 20, etc.)
    const bucketDays = 10

    const values = data
      .map((d) => Number(d.recovery_days))
      .filter((v) => Number.isFinite(v) && v >= 0)

    if (values.length === 0) return null

    const buckets = new Map()

    for (const v of values) {
      const lo = Math.floor(v / bucketDays) * bucketDays
      const hi = lo + bucketDays
      const key = `${lo}-${hi}`
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }

    const rows = [...buckets.entries()]
      .map(([key, count]) => {
        const [lo, hi] = key.split("-").map(Number)
        return {
          bucket: `${lo}–${hi}d`,
          lo,
          hi,
          count,
        }
      })
      .sort((a, b) => a.lo - b.lo)

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

            {/* X = Recovery time ranges */}
            <XAxis
              dataKey="bucket"
              tick={tick}
              axisLine={false}
              tickLine={false}
            />

            {/* Y = Count of drawdowns */}
            <YAxis
              tick={tick}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />

            <Tooltip
              contentStyle={tooltip}
              labelStyle={tooltipLabel}
              itemStyle={tooltipItem}
              labelFormatter={(label) => `Recovery: ${label}`}
              formatter={(value) => [value, "Drawdowns"]}
            />

            <Bar
              dataKey="count"
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

// Tooltip: black box, GOLD text
const tooltip = {
  backgroundColor: "#0B0B0B",
  border: "1px solid #222",
  color: GOLD,
  fontSize: 12,
}
const tooltipLabel = { color: GOLD }
const tooltipItem = { color: GOLD }
