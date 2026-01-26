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

  // Kill scrollbars in embeds (Framer)
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
    if (!Array.isArray(dd) || dd.length === 0) return null
    // Keep benchmark always mounted to avoid “stutter”; just fade it in/out.
    const b = Array.isArray(bench) ? bench : null
    return dd.map((d, i) => ({
      ...d,
      benchmarkDrawdown: b?.[i]?.drawdown,
    }))
  }, [dd, bench])

  const maxDD = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null
    let best = null
    for (const d of data) {
      if (!d || typeof d.drawdown !== "number" || !d.date) continue
      if (!best || d.drawdown < best.drawdown) best = d
    }
    return best
  }, [data])

  return (
    <div style={wrap}>
      {/* simple CSS to fade the benchmark line smoothly */}
      <style>{`
        .bench-path path {
          transition: opacity 260ms ease;
        }
      `}</style>

      <div style={topbar}>
        <div>
          <div style={title}>Drawdown Profile</div>
          <div style={subtitle}>
            Depth and duration of drawdowns across the full track record.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowBenchmark((v) => !v)}
          style={{
            ...btn,
            ...(showBenchmark ? btnOn : null),
          }}
        >
          {showBenchmark ? "Hide S&P 500" : "Compare to S&P 500"}
        </button>
      </div>

      {!data ? (
        <div style={loading}>Loading…</div>
      ) : (
        <>
          {ddErr ? <div style={err}>Data error: {ddErr}</div> : null}
          {benchErr ? <div style={err}>Benchmark error: {benchErr}</div> : null}

          <div style={chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                <XAxis
                  dataKey="date"
                  tick={tick}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  tick={tick}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", 0]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />

                <Tooltip
                  contentStyle={tooltip}
                  labelStyle={{ color: "#AAA" }}
                  itemStyle={{ color: GOLD }}
                  formatter={(v, name) => {
                    const label =
                      name === "benchmarkDrawdown" ? "S&P 500 Drawdown" : "Drawdown"
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

                {/* Benchmark drawdown (always mounted, just fades) */}
                <Line
                  className="bench-path"
                  type="monotone"
                  dataKey="benchmarkDrawdown"
                  stroke={ORANGE}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  strokeOpacity={showBenchmark ? 1 : 0}
                />

                {maxDD ? (
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
                ) : null}
              </AreaChart>
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
  fontFamily: "Inter, system-ui, Arial",
  overflow: "hidden",
}

const topbar = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 10,
}

const title = { color: "#EDEDED", fontSize: 16, fontWeight: 600, lineHeight: 1.1 }
const subtitle = { color: "#8A8A8A", fontSize: 12, marginTop: 6, maxWidth: 520 }

const chartWrap = {
  width: "100%",
  height: "calc(100vh - 86px)",
  border: "1px solid #151515",
  borderRadius: 14,
  overflow: "hidden",
  background: "#050505",
}

const btn = {
  background: "#0B0B0B",
  color: "#CFCFCF",
  border: "1px solid #222",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 12,
  cursor: "pointer",
  transition: "all 200ms ease",
  userSelect: "none",
  whiteSpace: "nowrap",
}
const btnOn = {
  borderColor: GOLD,
  color: GOLD,
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
