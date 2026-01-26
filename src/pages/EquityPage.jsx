// src/pages/EquityPage.jsx
import React, { useEffect, useMemo, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { useJson } from "../lib/useJson"

export default function EquityPage() {
  // ✅ Use the updated equity curve file
  const { data, error } = useJson("/equity_curve_updated.json")

  // Load benchmark only when needed (still smooth once shown)
  // Always load benchmark data
  const { data: benchData, error: benchErr } = useJson("/benchmark_equity_curve.json")

  // Merge series by date so both lines align perfectly
  const merged = useMemo(() => {
    if (!Array.isArray(data)) return null
    if (!showBenchmark) return data

    const benchMap = new Map((benchData || []).map((d) => [d.date, d]))
    return data.map((d) => {
      const b = benchMap.get(d.date)
      return {
        ...d,
        spx_equity_index: b ? b.equity_index : null,
      }
    })
  }, [data, benchData, showBenchmark])

  return (
    <div style={wrap}>
      {!merged ? <div style={loading}>Loading…</div> : (
        <>
          {error ? <div style={err}>Data error: {error}</div> : null}
          {benchErr ? <div style={err}>Benchmark error: {benchErr}</div> : null}

          <div style={topBar}>
            <button
              type="button"
              onClick={() => setShowBenchmark((v) => !v)}
              style={btn}
            >
              {showBenchmark ? "Hide S&P 500" : "Compare to S&P 500"}
            </button>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={merged}>
              <XAxis dataKey="date" hide />
              <YAxis tick={tick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltip} labelStyle={{ color: "#AAA" }} />

              {/* Caterium */}
              <Line
                type="monotone"
                dataKey="equity_index"
                stroke="#C9A24D"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={600}
              />

              {/* Benchmark (smooth fade-in / draw-in) */}
              {showBenchmark && (
                <Line
                  type="monotone"
                  dataKey="spx_equity_index"
                  stroke="#66B6FF"   // light blue
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={900}
                />
              )}
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

const topBar = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  marginBottom: 10,
}

const btn = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid #222",
  color: "#E6E6E6",
  padding: "8px 12px",
  borderRadius: 10,
  fontSize: 12,
  cursor: "pointer",
}

const loading = { color: "#777", fontSize: 12 }
const err = { color: "#777", fontSize: 12, marginBottom: 8 }
const tick = { fill: "#777", fontSize: 12 }
const tooltip = { backgroundColor: "#0B0B0B", border: "1px solid #222", color: "#E6E6E6", fontSize: 12 }
