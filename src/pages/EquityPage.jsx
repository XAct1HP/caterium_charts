import React from "react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { useJson } from "../lib/useJson"

export default function EquityPage() {
  const { data, error } = useJson("/equity_curve.json")

  return (
    <div style={wrap}>
      {!data ? <div style={loading}>Loading…</div> : (
        <>
          {error ? <div style={err}>Data error: {error}</div> : null}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" hide />
              <YAxis tick={tick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltip} labelStyle={{ color: "#AAA" }} />
              <Line type="monotone" dataKey="equity_index" stroke="#C9A24D" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}

const wrap = { width: "100vw", height: "100vh", background: "#000", padding: 16, boxSizing: "border-box", fontFamily: "Inter, system-ui, Arial" }
const loading = { color: "#777", fontSize: 12 }
const err = { color: "#777", fontSize: 12, marginBottom: 8 }
const tick = { fill: "#777", fontSize: 12 }
const tooltip = { backgroundColor: "#0B0B0B", border: "1px solid #222", color: "#E6E6E6", fontSize: 12 }
