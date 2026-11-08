import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="nav">
        <nav className="nav-links">
          <NavLink to="/notes">Notes</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/groups">Interest groups</NavLink>
          <NavLink to="/posts">My posts</NavLink>
          {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="nav-user">
          <span>{user?.name}</span>
          <button className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
