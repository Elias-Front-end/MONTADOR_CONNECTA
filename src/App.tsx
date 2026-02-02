import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardOverview from "@/pages/dashboard/Overview";
import Schedule from "@/pages/dashboard/Schedule";
import Profile from "@/pages/dashboard/Profile";
import NewService from "@/pages/dashboard/services/NewService";
import ServiceList from "@/pages/dashboard/services/ServiceList";
import Opportunities from "@/pages/dashboard/Opportunities";
import MontadoresRanking from "@/pages/dashboard/MontadoresRanking";

// Placeholder Components for routes not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-300 mb-4">{title}</h2>
    <p className="text-gray-500">Esta funcionalidade será implementada em breve.</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          
          {/* Montador Routes */}
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="schedule" element={<Schedule />} />
          
          {/* Partner Routes */}
          <Route path="services" element={<ServiceList />} />
          <Route path="services/new" element={<NewService />} />
          <Route path="ranking" element={<MontadoresRanking />} />
          <Route path="montadores" element={<PlaceholderPage title="Meus Montadores (Depreciado)" />} />
          
          {/* Shared Routes */}
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
