import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Loading } from './Loading';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAppSelector((state) => state.auth);

  console.log('🛡️ AdminRoute check:', { 
    loading, 
    userId: user?.id, 
    is_admin: user?.is_admin, 
    userEmail: user?.email 
  });

  if (loading) {
    console.log('⏳ AdminRoute: Still loading auth state...');
    return <Loading />;
  }

  if (!user) {
    console.log('🚫 AdminRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!user.is_admin) {
    console.log('🚫 AdminRoute: User is not admin, redirecting to login. User:', {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin
    });
    return <Navigate to="/login" replace />;
  }

  console.log('✅ AdminRoute: Admin access granted for user:', {
    id: user.id,
    email: user.email,
    is_admin: user.is_admin
  });

  return <>{children}</>;
};
