import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Logged in */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/notes" element={<NotesPage />} />
          {/* Later phases: /profile, /groups, /users/:id/posts, /posts, and /admin inside <RequireAdmin /> */}
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/notes" replace />} />
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Routes>
  );
}
