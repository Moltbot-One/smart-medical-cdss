import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import PatientDetail from '@/pages/PatientDetail';
import Diagnosis from '@/pages/Diagnosis';
import Medication from '@/pages/Medication';
import LabResults from '@/pages/LabResults';
import Treatment from '@/pages/Treatment';
import QualityControl from '@/pages/QualityControl';
import Knowledge from '@/pages/Knowledge';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAppStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/medication" element={<Medication />} />
          <Route path="/lab-results" element={<LabResults />} />
          <Route path="/treatment" element={<Treatment />} />
          <Route path="/quality" element={<QualityControl />} />
          <Route path="/knowledge" element={<Knowledge />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
