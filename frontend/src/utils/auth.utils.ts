import { useContext, useCallback } from 'react';
import { AuthContext, defaultAuth, DispatchContext } from '../context/AuthContext';

export function useLogout() {
  const dispatch = useContext(DispatchContext);
  const userData = useContext(AuthContext);

  const logout = useCallback(async () => {
    dispatch({
      type: "LOADING",
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

      console.log("Logged out at backend");
      dispatch({
        type: "LOGOUT",
        payload: {
          ...defaultAuth,
          isLoading: false,
        },
      });

    } catch (err) {
      console.error("Logout Error:", err);

      dispatch({
        type: "LOGOUT_FAILURE",
        payload: { ...userData, isLoading: false },
      });

    }
  }, [dispatch, userData]); // Dependencies for useCallback

  return logout;
}