// src/pages/AllocationPage.jsx
import React, { useEffect } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useJson } from "../lib/useJson"

export default function AllocationPage() {
  const { data, error } = useJson("/allocation_two_sleeve.json")

  // Kill scrollbars (Framer-safe, same pattern as other pages)
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [])

  return (
    <div style={wrap}>
      {!data ? (
        <div style={loading}>Loading…</div>
      ) : (
        <>
          {error ? <div style={err}>Data error: {error}</div> : null}

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} stackOffset="expand">
              <XAxis dataKey="date" hide />

              <YAxis
                tick={tick}
                axisLine={false}
                tickLine={false}
                domain={[0, 1]}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
              />

              <Tooltip
                contentStyle={tooltip}
                labelStyle={{ color: "#AAA" }}
                formatter={(v, key) => {
                  const labelMap = {
                    aggressive_pct: "Main Strategy",
                    reserve_pct: "Reserve Fund",
                  }
                  return [`${(v * 100).toFixed(1)}%`, labelMap[key] ?? key]
                }}
              />

              {/* Main Strategy */}
              <Area
                type="monotone"
                dataKey="aggressive_pct"
                stackId="1"
                stroke="#C9A24D"
                fill="#C9A24D"
                fillOpacity={0.22}
                dot={false}
              />

              {/* Reserve Fund */}
              <Area
                type="monotone"
                dataKey="reserve_pct"
                stackId="1"
                stroke="#777"
                fill="#777"
                fillOpacity={0.18}
                dot={false}
              />
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
  overflow: "hidden", // ✅ KEY LINE
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
