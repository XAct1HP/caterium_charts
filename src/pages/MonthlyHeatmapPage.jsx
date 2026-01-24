import React from "react"
import { useJson } from "../lib/useJson"

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x))
}

// Use EXACT same colors as legend:
const RED = [217, 75, 75]       // rgb(217,75,75)
const ORANGE = [201, 162, 77]   // rgb(201,162,77)
const GREEN = [76, 175, 80]     // rgb(76,175,80)

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t)
}

function interpColor(c1, c2, t) {
  return `rgb(${lerp(c1[0], c2[0], t)},${lerp(c1[1], c2[1], t)},${lerp(c1[2], c2[2], t)})`
}

function cellStyle(r) {
  if (r == null || Number.isNaN(r)) {
    return { background: "#0B0B0B", border: "1px solid #151515" }
  }

  // Map [-10%, +10%] to [-1, +1]
  const max = 0.10
  const v = clamp(r, -max, max) / max

  // Brighter: stronger opacity scaling
  const opacity = 0.35 + (Math.abs(v) * 0.55) // 0.35..0.90

  let bg
  if (v < 0) {
    // red -> orange
    const t = v + 1 // -1..0 -> 0..1
    bg = interpColor(RED, ORANGE, t)
  } else {
    // orange -> green
    const t = v // 0..1
    bg = interpColor(ORANGE, GREEN, t)
  }

  return {
    background: bg,
    opacity,
    border: "1px solid #151515",
  }
}

export default function MonthlyHeatmapPage() {
  const { data, error } = useJson("/monthly_returns.json")

  if (!data) {
    return (
      <div style={wrap}>
        <div style={loading}>Loading…</div>
      </div>
    )
  }

  const byYear = new Map()
  for (const row of data) {
    const y = row.year
    const m = row.month
    const r = row.return
    if (!byYear.has(y)) byYear.set(y, Array(12).fill(null))
    byYear.get(y)[m - 1] = r
  }
  const years = Array.from(byYear.keys()).sort((a, b) => a - b)

  return (
    <div style={wrap}>
      {error ? <div style={err}>Data error: {error}</div> : null}

      {/* Legend */}
      <div style={legendWrap}>
        <div style={gradBar} />
        <div style={legendLabels}>
          <span>-10%</span>
          <span>0%</span>
          <span>+10%</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "48px repeat(12, 1fr)", gap: 6 }}>
        <div />
        {monthNames.map((m) => (
          <div key={m} style={{ color: "#777", fontSize: 11, textAlign: "center" }}>{m}</div>
        ))}

        {years.map((y) => (
          <React.Fragment key={y}>
            <div style={{ color: "#777", fontSize: 11, display: "flex", alignItems: "center" }}>{y}</div>
            {byYear.get(y).map((r, idx) => (
              <div
                key={idx}
                title={r == null ? `${y}-${idx + 1}: n/a` : `${y}-${idx + 1}: ${(r * 100).toFixed(2)}%`}
                style={{
                  ...cellStyle(r),
                  height: 28,
                  borderRadius: 6,
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
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

const legendWrap = { marginBottom: 12 }
const gradBar = {
  height: 10,
  borderRadius: 999,
  border: "1px solid #151515",
  marginTop: 6,
  background:
    "linear-gradient(90deg, rgb(217,75,75) 0%, rgb(201,162,77) 50%, rgb(76,175,80) 100%)",
}
const legendLabels = {
  display: "flex",
  justifyContent: "space-between",
  color: "#777",
  fontSize: 11,
  marginTop: 6,
}
