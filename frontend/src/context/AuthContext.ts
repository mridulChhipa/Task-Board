import { createContext } from 'react';
import type { Project } from '../types/project.types';
import type { NotificationDTO } from '../types/Notification.types';

export interface User {
  userId: number;
  name: string;
  email: string;
  avatar: string;
  role: 'GLOBAL_ADMIN' | 'USER' | null;
  projects: Project[];
  notifications: NotificationDTO[];
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
  type: 'LOGIN' | 'REFRESH_FAILURE' | 'SET_NOTIFICATIONS';
  payload: AuthContextType | NotificationDTO[];
}

export const DispatchContext = createContext<React.Dispatch<DispatchType>>(
  () => {},
);

export function authReducer(
  state: AuthContextType,
  action: DispatchType,
): AuthContextType {
  switch (action.type) {
    case 'LOGIN':
      return action.payload as AuthContextType;
    case 'REFRESH_FAILURE':
      return action.payload as AuthContextType;
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              notifications: action.payload as NotificationDTO[],
            }
          : state.user,
      };
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
    default:
      return state;
  }
}
