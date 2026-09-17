import { Link } from 'react-router-dom';

function Unauthorized() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold text-red-600">403 - Forbidden</h1>
      <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
      <Link to="/" className="text-blue-600 underline">
        Back to home
      </Link>
    </main>
  );
}

export default Unauthorized;
