// src/pages/MobileHeatmap.jsx
import React, { useEffect } from "react"
import { useJson } from "../lib/useJson"

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x))
}

const RED = [217, 75, 75]
const ORANGE = [201, 162, 77]
const GREEN = [76, 175, 80]

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

  const max = 0.10
  const v = clamp(r, -max, max) / max
  const opacity = 0.35 + (Math.abs(v) * 0.55)

  let bg
  if (v < 0) {
    bg = interpColor(RED, ORANGE, v + 1)
  } else {
    bg = interpColor(ORANGE, GREEN, v)
  }

  return {
    background: bg,
    opacity,
    border: "1px solid #151515",
  }
}

export default function MonthlyHeatmapPage() {
  const { data, error } = useJson("/monthly_returns.json")

  // 🔒 Kill scrollbars (Framer-safe)
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

  if (!data) {
    return (
      <div style={wrap}>
        <div style={loading}>Loading…</div>
      </div>
    )
  }

  const byYear = new Map()
  for (const row of data) {
    if (!byYear.has(row.year)) byYear.set(row.year, Array(12).fill(null))
    byYear.get(row.year)[row.month - 1] = row.return
  }

  const yearsAll = Array.from(byYear.keys()).sort((a, b) => a - b)
  const years = yearsAll.slice(-4) // ✅ 4 year columns + 1 month column = 5 columns total

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

      {/* Year header row (kept OUTSIDE the grid so grid stays 12 rows) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px repeat(4, 1fr)",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <div />
        {years.map((y) => (
          <div
            key={y}
            style={{ color: "#777", fontSize: 11, textAlign: "center" }}
          >
            {y}
          </div>
        ))}
      </div>

      {/* ✅ Mobile grid: 5 columns × 12 rows */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px repeat(4, 1fr)", // 5 columns total
          gridTemplateRows: "repeat(12, 28px)",       // 12 rows total
          gap: 6,
        }}
      >
        {monthNames.map((m, monthIdx) => (
          <React.Fragment key={m}>
            {/* Month label column */}
            <div
              style={{
                color: "#777",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
              }}
            >
              {m}
            </div>

            {/* 4 year columns */}
            {years.map((y) => {
              const r = byYear.get(y)?.[monthIdx] ?? null
              return (
                <div
                  key={`${y}-${monthIdx}`}
                  title={
                    r == null
                      ? `${y}-${monthIdx + 1}: n/a`
                      : `${y}-${monthIdx + 1}: ${(r * 100).toFixed(2)}%`
                  }
                  style={{
                    ...cellStyle(r),
                    height: 28,
                    borderRadius: 6,
                  }}
                />
              )
            })}
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
  overflow: "hidden",
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
