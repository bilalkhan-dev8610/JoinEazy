import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

        <div className="mt-6 space-y-3 rounded-lg bg-white p-6 shadow-sm">
          <div>
            <span className="block text-xs uppercase text-gray-400">Full name</span>
            <span className="text-gray-800">{user?.fullName}</span>
          </div>
          <div>
            <span className="block text-xs uppercase text-gray-400">Email</span>
            <span className="text-gray-800">{user?.email}</span>
          </div>
          <div>
            <span className="block text-xs uppercase text-gray-400">Role</span>
            <span className="capitalize text-gray-800">{user?.role}</span>
          </div>
          {user?.role === 'student' && (
            <div>
              <span className="block text-xs uppercase text-gray-400">Student ID</span>
              <span className="break-all font-mono text-sm text-gray-800">{user?.id}</span>
              <p className="mt-1 text-xs text-gray-400">
                Share this with a group leader so they can add you by ID.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
