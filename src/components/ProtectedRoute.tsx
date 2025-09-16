import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('client' | 'professional' | 'admin')[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['client', 'professional', 'admin'],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(profile.user_role)) {
    // Redirect to appropriate dashboard based on user role
    const userRoleRedirects = {
      client: '/client-dashboard',
      professional: '/professional-dashboard',
      admin: '/admin-dashboard'
    };
    
    const redirectPath = userRoleRedirects[profile.user_role];
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Role-specific route components
export function ClientRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['client']}>
      {children}
    </ProtectedRoute>
  );
}

export function ProfessionalRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['professional']}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <LoadingSkeleton rows={3} />
      </div>
    );
  }

  // Redirect authenticated users to their dashboard
  if (user && profile) {
    const userRoleRedirects = {
      client: '/client-dashboard',
      professional: '/professional-dashboard',
      admin: '/admin-dashboard'
    };
    
    const redirectPath = userRoleRedirects[profile.user_role];
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}