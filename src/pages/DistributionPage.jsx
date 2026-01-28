import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { useJson } from "../lib/useJson"

function fmt(x) {
  if (x == null || Number.isNaN(x)) return ""
  // you can change decimals if you want
  return Number(x).toFixed(2)
}

export default function DistributionPage() {
  const { data, error } = useJson("/trade_distribution.json")

  const shaped = React.useMemo(() => {
    if (!Array.isArray(data)) return null
    return data.map((d) => {
      const left = Number(d.bin_left)
      const right = Number(d.bin_right)
      return {
        ...d,
        bin_left: left,
        bin_right: right,
        bin_center: (left + right) / 2,
        bucket_label: `${fmt(left)} to ${fmt(right)}`,
      }
    })
  }, [data])

  return (
    <div style={wrap}>
      {!shaped ? (
        <div style={loading}>Loading…</div>
      ) : (
        <>
          {error ? <div style={err}>Data error: {error}</div> : null}

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shaped}>
              <XAxis
                xAxisId="x"
                dataKey="bin_center"
                type="number"
                domain={["dataMin", "dataMax"]}
                hide
              />

              <YAxis tick={tick} axisLine={false} tickLine={false} width={20} />

              {/* Vertical 0 line */}
              <ReferenceLine
                xAxisId="x"
                x={0}
                stroke="#E03A3A"
                strokeWidth={2}
                ifOverflow="extendDomain"
                label={{
                  value: "0",
                  position: "top",
                  fill: "#E03A3A",
                  fontSize: 12,
                }}
              />

              <Tooltip
                contentStyle={tooltip}
                labelStyle={{ color: "#AAA" }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload
                  return p?.bucket_label ? `Bucket: ${p.bucket_label}` : ""
                }}
                formatter={(v) => [v, "Count"]}
              />

              <Bar dataKey="count" fill="#C9A24D" opacity={0.85} />
            </BarChart>
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
const loading = { color: "#777", fontSize: 12 }
const err = { color: "#777", fontSize: 12, marginBottom: 8 }
const tick = { fill: "#777", fontSize: 12 }
const tooltip = {
  backgroundColor: "#0B0B0B",
  border: "1px solid #222",
  color: "#E6E6E6",
  fontSize: 12,
}
