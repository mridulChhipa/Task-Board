import { useContext, useCallback } from 'react';
import {
  AuthContext,
  defaultAuth,
  DispatchContext,
} from '../context/AuthContext';
import type { Project } from '../types/project.types';

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

    // console.log(user);
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
      let allProjects: Project[] = userData.data.projectData;

      if (userData.data.personalData.globalRole === 'GLOBAL_ADMIN') {
        // console.log('Trying to fetch global admin project');
        const globalRes = await fetch(
          'http://localhost:3000/api/project/all-projects/global',
          {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (!globalRes.ok) {
          throw new Error("Can't Fetch all projects");
        }
        // console.log('Done fetching');

        const data = await globalRes.json();
        allProjects = await data.allProjects;
        console.log('All Projects', allProjects);
        userData.data.personalData.projectData = allProjects;
      }

      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            ...user,
            // userId: userData.userId,
            name: userData.data.personalData.name,
            email: userData.data.personalData.email,
            role: userData.data.personalData.globalRole,
            projects: allProjects,
            avatar: userData.data.personalData.avatar,
          },
          isLoading: false,
        },
      });
    } catch (err) {
      console.error('Fetch User Error:', err);

      dispatch({
        type: 'REFRESH_FAILURE',
        payload: { user, isLoading: false },
      });
    }
  }, [user, dispatch]);

  return fetchUser;
}
