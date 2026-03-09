import { useEffect, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import {
  authReducer,
  DispatchContext,
  defaultAuth,
  AuthContext,
} from './AuthContext';

let isRefreshing = false;
let refreshPromise: Promise<Record<string, unknown> | null> | null = null;

async function tryRefreshToken(): Promise<Record<string, unknown> | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = fetch('http://localhost:3000/api/auth/refresh', {
    method: 'PATCH',
    credentials: 'include',
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("No response");
      }
      return res.json();
    }).catch((err) => {
      throw err;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authData, dispatch] = useReducer(authReducer, defaultAuth);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        // const refreshRes = await fetch('http://localhost:3000/api/auth/refresh', {
        //   method: 'PATCH',
        //   credentials: 'include',
        // });

        // if (!refreshRes.ok) {
        //   return;
        // }

        void isLoading;
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          console.log('Wait');
          return;
        }

        // const { accessToken } = await refreshRes.json();
        // const { accessToken } = refreshed;
        await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' })
          .then((res) => res.json()) // Return the promise here
          .then((user) => {          // This 'user' is now the actual object
            dispatch({
              type: 'LOGIN',
              payload: { user, isLoading: false },
            });
          });
      } catch (err) {
        console.log('Could not restore user', err);
        
        dispatch({
          type: "REFRESH_FAILURE",
          payload: { ...defaultAuth, isLoading: false },
        });
      } finally {
        setIsLoading(false);
      }
    };

    restoreUser();
  }, [isLoading]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
    </DispatchContext.Provider>
  );
};
