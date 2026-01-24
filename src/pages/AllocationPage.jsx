import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts"
import { useJson } from "../lib/useJson"

export default function AllocationPage() {
  const { data, error } = useJson("/allocation_two_sleeve.json")

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
                  const name =
                    key === "aggressive_pct" ? "Main Strategy" : "Reserve Fund"
                  return [`${(v * 100).toFixed(1)}%`, name]
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
                name="Main Strategy"
              />

              {/* Reserve Fund */}
              <Area
                type="monotone"
                dataKey="reserve_pct"
                stackId="1"
                stroke="#777"
                fill="#777"
                fillOpacity={0.18}
                name="Reserve Fund"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Simple, high-contrast labels */}
          <div style={legendRow}>
            <div style={legendItem}>
              <span style={{ ...dot, background: "#C9A24D" }} />
              <span>Main Strategy</span>
            </div>
            <div style={legendItem}>
              <span style={{ ...dot, background: "#777" }} />
              <span>Reserve Fund</span>
            </div>
          </div>
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

const legendRow = {
  display: "flex",
  gap: 16,
  marginTop: 10,
  color: "#E6E6E6",
  fontSize: 12,
  alignItems: "center",
}
const legendItem = { display: "flex", gap: 8, alignItems: "center" }
const dot = { width: 10, height: 10, borderRadius: 999 }
