import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import GroupsPage from './pages/GroupsPage';
import NotesPage from './pages/NotesPage';
import PostsPage from './pages/PostsPage';
import ProfilePage from './pages/ProfilePage';
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/users/:id/posts" element={<PostsPage />} />
          {/* Later phase: /admin inside <RequireAdmin /> */}
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/notes" replace />} />
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Routes>
  );
}
