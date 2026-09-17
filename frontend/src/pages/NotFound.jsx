import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">404 - Page Not Found</h1>
      <Link to="/" className="text-blue-600 underline">
        Back to home
      </Link>
    </main>
  );
}

export default NotFound;
