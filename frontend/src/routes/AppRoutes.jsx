import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import NotFound from '../pages/NotFound.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Profile from '../pages/Profile.jsx';
import StudentDashboard from '../pages/StudentDashboard.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import MyGroup from '../pages/MyGroup.jsx';
import AdminAssignments from '../pages/AdminAssignments.jsx';
import StudentAssignments from '../pages/StudentAssignments.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

/**
 * Central route table. Add new <Route> entries here as pages are built
 * in later phases.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyGroup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAssignments />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
