import { Routes, Route, Navigate } from "react-router-dom"
import Index from "@/pages/Index"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
