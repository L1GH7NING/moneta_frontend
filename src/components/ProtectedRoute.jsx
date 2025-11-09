import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider'; // Adjust the path as needed

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading component like <Spinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;