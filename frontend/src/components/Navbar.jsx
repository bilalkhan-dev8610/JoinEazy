import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
      <Link to="/" className="text-lg font-semibold text-gray-800">
        JoinEazy
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/profile" className="text-gray-600 hover:text-gray-900">
            {user.fullName} <span className="text-gray-400">({user.role})</span>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded bg-gray-800 px-3 py-1.5 text-white hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
