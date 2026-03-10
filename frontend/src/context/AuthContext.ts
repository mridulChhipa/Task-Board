import { createContext } from 'react';
import type { Project } from '../types/project.types';

export interface User {
  userId: number;
  name: string;
  email: string;
  role: 'GLOBAL_ADMIN' | 'USER' | null;
  projects: Project[];
  avatar: string;
}

export interface AuthContextType {
  isLoading: boolean;
  user: User | null;
}

export const defaultAuth: AuthContextType = {
  isLoading: true,
  user: null,
};

export const AuthContext = createContext(defaultAuth);

export interface DispatchType {
  type: string;
  payload: AuthContextType;
}

export const DispatchContext = createContext<React.Dispatch<DispatchType>>(
  () => {},
);

export function authReducer(
  state: AuthContextType,
  action: DispatchType,
): AuthContextType {
  // switch (action.type) {
  //   case 'LOGIN':
  //     return { ...action.payload };
  //   case 'LOGOUT':
  //     return { ...action.payload };
  //   case 'LOADING':
  //     return { ...action.payload };
  //   case 'LOGOUT_FAILURE':
  //     return { ...action.payload };
  //   case 'REFRESH_FAILURE':
  //     return { ...action.payload };
  //   case 'PROJECT_CREATED':
  //     return { ...action.payload };
  //   default:
  //     return state;
  // }
  return { ...action.payload };
}
