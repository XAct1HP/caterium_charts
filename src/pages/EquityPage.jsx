// src/pages/EquityPage.jsx
import React, { useMemo, useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useJson } from "../lib/useJson"

export default function EquityPage() {
  const { data, error } = useJson("/equity_curve_updated.json")
  const { data: benchData, error: benchErr } = useJson("/benchmark_equity_curve.json")

  const [showBenchmark, setShowBenchmark] = useState(false)

  // Extra-safe: prevent any body-level scrollbars in embeds
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

  const merged = useMemo(() => {
    if (!Array.isArray(data)) return null
    if (!showBenchmark || !Array.isArray(benchData)) return data

    const benchMap = new Map(benchData.map((d) => [d.date, d]))
    return data.map((d) => ({
      ...d,
      spx_equity_index: benchMap.get(d.date)?.equity_index ?? null,
    }))
  }, [data, benchData, showBenchmark])

  return (
    <div style={wrap}>
      {!merged ? (
        <div style={loading}>Loading…</div>
      ) : (
        <>
          {error ? <div style={err}>Data error: {error}</div> : null}
          {showBenchmark && benchErr ? (
            <div style={err}>Benchmark error: {benchErr}</div>
          ) : null}

          <div style={topBar}>
            <button
              type="button"
              onClick={() => setShowBenchmark((v) => !v)}
              style={btn}
            >
              {showBenchmark ? "Hide S&P 500" : "Compare to S&P 500"}
            </button>
          </div>

          <div style={chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged}>
                <XAxis dataKey="date" hide />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltip} labelStyle={{ color: "#AAA" }} />

                <Line
                  type="monotone"
                  dataKey="equity_index"
                  stroke="#C9A24D"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={600}
                />

                {showBenchmark && (
                  <Line
                    type="monotone"
                    dataKey="spx_equity_index"
                    stroke="#66B6FF"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                    animationDuration={900}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
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
  overflow: "hidden", // ✅ KEY FIX: prevents scrollbars from padding/overflow
  fontFamily: "Inter, system-ui, Arial",
}

const topBar = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  marginBottom: 10,
}

const chartWrap = {
  width: "100%",
  height: "calc(100% - 44px)", // leaves room for the button row
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
const tooltip = {
  backgroundColor: "#0B0B0B",
  border: "1px solid #222",
  color: "#E6E6E6",
  fontSize: 12,
}
