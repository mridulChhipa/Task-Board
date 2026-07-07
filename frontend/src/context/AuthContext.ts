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

export type DispatchType =
  | {
      type:
        | 'LOGIN'
        | 'LOGOUT'
        | 'LOADING'
        | 'LOGOUT_FAILURE'
        | 'REFRESH_FAILURE'
        | 'PROJECT_CREATED'
        | 'PROJECT_UPDATED'
        | 'UPDATE_USER';
      payload: AuthContextType;
    }
  | {
      type: 'SET_NOTIFICATIONS';
      payload: NotificationDTO[];
    };

export const DispatchContext = createContext<React.Dispatch<DispatchType>>(
  () => {},
);

export function authReducer(
  state: AuthContextType,
  action: DispatchType,
): AuthContextType {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              notifications: action.payload,
            }
          : state.user,
      };
    default:
      // Every other action replaces the auth state with its payload.
      return action.payload;
  }
}
