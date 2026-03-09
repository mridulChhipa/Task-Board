import { useContext, useCallback } from 'react';
import {
  AuthContext,
  defaultAuth,
  DispatchContext,
} from '../context/AuthContext';

export function useLogout() {
  const dispatch = useContext(DispatchContext);
  const userData = useContext(AuthContext);

  const logout = useCallback(async () => {
    dispatch({
      type: 'LOADING',
      payload: { ...userData, isLoading: true },
    });

    try {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }

      console.log('Logged out at backend');
      dispatch({
        type: 'LOGOUT',
        payload: {
          ...defaultAuth,
          isLoading: false,
        },
      });
    } catch (err) {
      console.error('Logout Error:', err);

      dispatch({
        type: 'LOGOUT_FAILURE',
        payload: { ...userData, isLoading: false },
      });
    }
  }, [dispatch, userData]); // Dependencies for useCallback

  return logout;
}

export function useFetchUser() {
  const dispatch = useContext(DispatchContext);
  const { user } = useContext(AuthContext);

  const fetchUser = useCallback(async () => {
    if (!user || user?.name) {
      return;
    }
    dispatch({
      type: 'LOADING',
      payload: { user, isLoading: true },
    });

    console.log(user);
    try {
      const userRes = await fetch(
        `http://localhost:3000/api/auth/${user?.userId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!userRes.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userRes.json();

      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            ...user,
            // userId: userData.userId,
            name: userData.data.personalData.name,
            email: userData.data.personalData.email,
            role: userData.data.personalData.globalRole,
            projects: userData.data.projectData,
            avatar: userData.data.personalData.avatar,
          },
          isLoading: false,
        },
      });
    } catch (err) {
      console.error('Logout Error:', err);

      dispatch({
        type: 'REFRESH_FAILURE',
        payload: { user, isLoading: false },
      });
    }
  }, [user, dispatch]);

  return fetchUser;
}
