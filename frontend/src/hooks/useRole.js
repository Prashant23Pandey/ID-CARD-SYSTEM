import { useAuth } from './useAuth';
import { ROLES } from '../constants';

export const useRole = () => {
  const { role } = useAuth();

  const isSuperadmin = role === ROLES.SUPERADMIN;
  const isSchooladmin = role === ROLES.SCHOOLADMIN;
  const isTeacher = role === ROLES.TEACHER;

  const hasRole = (allowedRoles) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return {
    isSuperadmin,
    isSchooladmin,
    isTeacher,
    hasRole,
    currentRole: role,
  };
};
