import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import EquityPage from "./pages/EquityPage"
import DrawdownPage from "./pages/DrawdownPage"
import AllocationPage from "./pages/AllocationPage"
import MonthlyHeatmapPage from "./pages/MonthlyHeatmapPage"
import DistributionPage from "./pages/DistributionPage"
import DrawdownRecoveryPage from "./pages/DrawdownRecoveryPage"
import MobileHeatmap from "./pages/MobileHeatmap"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/equity" replace />} />
      <Route path="/equity" element={<EquityPage />} />
      <Route path="/drawdown" element={<DrawdownPage />} />
      <Route path="/allocation" element={<AllocationPage />} />
      <Route path="/monthly" element={<MonthlyHeatmapPage />} />
      <Route path="/distribution" element={<DistributionPage />} />
      <Route path="/recovery" element={<DrawdownRecoveryPage />} />
      <Route path="/mobileheatmap" element={<MobileHeatmap />} />
    </Routes>
  )
}
