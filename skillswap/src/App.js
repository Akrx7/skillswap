import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Signup from './components/Signup';
import Login from './components/Login';
import SkillForm from './components/SkillForm';
import SkillList from './components/SkillList';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Connections from './components/Connections';
import Collaboration from './components/Collaboration';
import ProjectDetail from './components/ProjectDetail';

function ProtectedRoute({ children }) {
  const user = useAuth();
  if (user === undefined) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your SkillSwap Dashboard</h1>
          <p className="text-gray-600">Share your skills and discover new opportunities</p>
        </div>
        <div className="space-y-8">
          <SkillForm />
          <SkillList />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <Navbar />
              <Connections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collaboration"
          element={
            <ProtectedRoute>
              <Navbar />
              <Collaboration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <Navbar />
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId/chat"
          element={
            <ProtectedRoute>
              <Navbar />
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
