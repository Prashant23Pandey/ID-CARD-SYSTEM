import { useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectCurrentRole,
  selectCurrentSchoolId,
} from '../features/auth/authSlice';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectCurrentRole);
  const schoolId = useSelector(selectCurrentSchoolId);

  return { user, isAuthenticated, role, schoolId };
};
