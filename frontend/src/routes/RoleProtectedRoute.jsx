import { Navigate, Outlet } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { hasRole } = useRole();

  if (!hasRole(allowedRoles)) {
    // Redirect to a 403 Forbidden page or dashboard fallback
    // For now, redirecting to a generic 403 or fallback logic could be here
    // But returning null or generic access denied page is standard.
    // Assuming we have a global redirect or access denied component:
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>403 - Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
