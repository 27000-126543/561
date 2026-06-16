import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Warnings from "@/pages/Warnings";
import WarningDetail from "@/pages/WarningDetail";
import SalaryVerify from "@/pages/SalaryVerify";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import System from "@/pages/System";
import ProvinceDetail from "@/pages/ProvinceDetail";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/warnings" element={<Warnings />} />
          <Route path="/warnings/:id" element={<WarningDetail />} />
          <Route path="/salary-verify" element={<SalaryVerify />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/system" element={<System />} />
          <Route path="/province/:name" element={<ProvinceDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}
