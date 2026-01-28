// src/pages/DrawdownPage.jsx
import React from "react"
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts"
import { useJson } from "../lib/useJson"

const GOLD = "#D4AF37"
const ORANGE = "#F2A23A"
const RED = "#D94B4B"

function formatPct(x) {
  if (x == null || Number.isNaN(x)) return ""
  return `${(x * 100).toFixed(2)}%`
}

export default function DrawdownPage() {
  const { data: dd, error: ddErr } = useJson("/drawdown_updated.json")
  const { data: bench, error: benchErr } = useJson("/benchmark_drawdown.json")

  const [showBenchmark, setShowBenchmark] = React.useState(false)

  // Kill scrollbars (Framer-safe)
  React.useEffect(() => {
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [])

  const data = React.useMemo(() => {
    if (!Array.isArray(dd)) return null
    const b = Array.isArray(bench) ? bench : null
    return dd.map((d, i) => ({
      ...d,
      benchmarkDrawdown: b?.[i]?.drawdown ?? null,
    }))
  }, [dd, bench])

  const maxDD = React.useMemo(() => {
    if (!Array.isArray(data)) return null
    return data.reduce((min, d) =>
      d.drawdown < min.drawdown ? d : min
    )
  }, [data])

  return (
    <div style={wrap}>
      <style>{`
        .bench-line path {
          transition: opacity 260ms ease;
        }
      `}</style>

      <div style={topBar}>
        <button
          type="button"
          onClick={() => setShowBenchmark((v) => !v)}
          style={btn}
        >
          {showBenchmark ? "Hide S&P 500" : "Compare to S&P 500"}
        </button>
      </div>

      {!data ? (
        <div style={loading}>Loading…</div>
      ) : (
        <>
          {ddErr ? <div style={err}>Data error: {ddErr}</div> : null}
          {showBenchmark && benchErr ? (
            <div style={err}>Benchmark error: {benchErr}</div>
          ) : null}

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                hide
              />
              <YAxis
                tick={tick}
                axisLine={false}
                tickLine={false}
                domain={[-0.30, 0]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                width={30}
              />

              <Tooltip
                contentStyle={tooltip}
                labelStyle={{ color: "#AAA" }}
                itemStyle={{ color: GOLD }}
                formatter={(v, name) => {
                  const label =
                    name === "benchmarkDrawdown"
                      ? "S&P 500 Drawdown"
                      : "Drawdown"
                  return [formatPct(v), label]
                }}
              />

              {/* Portfolio drawdown */}
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke={RED}
                fill={RED}
                fillOpacity={0.22}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              {/* Benchmark drawdown (always mounted, fades in/out) */}
              <Line
                className="bench-line"
                type="monotone"
                dataKey="benchmarkDrawdown"
                stroke={ORANGE}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                strokeOpacity={showBenchmark ? 1 : 0}
              />

              {maxDD && (
                <ReferenceDot
                  x={maxDD.date}
                  y={maxDD.drawdown}
                  r={6}
                  fill={RED}
                  stroke="#000"
                  strokeWidth={2}
                  label={{
                    value: "Max Drawdown",
                    position: "bottom",
                    fill: "#E6E6E6",
                    fontSize: 12,
                  }}
                />
              )}
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
  overflow: "hidden",
}

const topBar = {
  display: "flex",
  justifyContent: "flex-end",
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
const err = { color: "#777", fontSize: 12, marginBottom: 6 }
const tick = { fill: "#777", fontSize: 12 }

const tooltip = {
  backgroundColor: "#0B0B0B",
  border: "1px solid #222",
  color: GOLD,
  fontSize: 12,
}
