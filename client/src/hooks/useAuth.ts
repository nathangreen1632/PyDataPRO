import { useAuthContext } from '../context/AuthContext';
import type { AuthContextType } from '../context/AuthContext';

export const useAuth = (): AuthContextType => {
  return useAuthContext();
};
