import { useAuthContext } from './useAuthContext'; // ✅ point to new file
import type { AuthContextType } from '../context/AuthContext';

export const useAuth = (): AuthContextType => {
  return useAuthContext();
};
