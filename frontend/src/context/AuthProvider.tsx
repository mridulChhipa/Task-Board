import { useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';

import { API_URL } from '../config';
import {
  authReducer,
  DispatchContext,
  defaultAuth,
  AuthContext,
} from './AuthContext';
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from '../utils/notification.socket';

async function tryRefreshToken(): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'PATCH',
    credentials: 'include',
  });
  return res.ok;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authContext, dispatch] = useReducer(authReducer, defaultAuth);

  useEffect(() => {
    let cancelled = false;

    const restoreUser = async () => {
      try {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          throw new Error('No valid session');
        }

        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include',
        });
        const user = await res.json();
        if (cancelled) {
          return;
        }

        dispatch({
          type: 'LOGIN',
          payload: {
            user: {
              userId: user.sub,
              email: user.email,
              name: '',
              projects: [],
              avatar: '',
              role: user.role,
              notifications: user.notifications || [],
            },
            isLoading: false,
          },
        });

        connectNotificationSocket(dispatch);
      } catch {
        if (!cancelled) {
          dispatch({
            type: 'REFRESH_FAILURE',
            payload: { ...defaultAuth, isLoading: false },
          });
        }
      }
    };

    restoreUser();

    return () => {
      cancelled = true;
      disconnectNotificationSocket();
    };
  }, []);

  return (
    <DispatchContext.Provider value={dispatch}>
      <AuthContext.Provider value={authContext}>
        {children}
      </AuthContext.Provider>
    </DispatchContext.Provider>
  );
};
