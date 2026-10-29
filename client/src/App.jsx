import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { useAuth } from "./AuthContext.jsx";

function AuthRoute({ mode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <AuthPage key={mode} mode={mode} />;
}

export default function App() {
  return <Routes>
    <Route element={<Shell />}>
      <Route index element={<Marketplace />} />
      <Route path="jobs/:id" element={<JobDetail />} />
      <Route path="login" element={<AuthRoute mode="login" />} />
      <Route path="register" element={<AuthRoute mode="register" />} />
      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<main className="not-found"><h1>That page wandered off.</h1><p>Let’s get you back to the good stuff.</p><a className="button button-primary" href="/">Explore opportunities</a></main>} />
    </Route>
  </Routes>;
}
