import { useAuthContext } from './useAuthContext';
import type { AuthContextType } from '../context/AuthContext';

export const useAuth = (): AuthContextType => {
  return useAuthContext();
};
