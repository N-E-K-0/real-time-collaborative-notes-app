"use client";

import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  // Attach the access token to outgoing requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => axios.interceptors.request.eject(requestInterceptor);
  }, [accessToken]);

  // Response interceptor to refresh token on 401 errors
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          process.env.NEXT_PUBLIC_BACKEND_URL
        ) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/token`,
              {},
              { withCredentials: true }
            );
            setAccessToken(res.data.accessToken);
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${res.data.accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            console.error(
              "Refresh token failed. Logging out user.",
              refreshError
            );
            // Optionally clear token or redirect to login
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(responseInterceptor);
  }, []);

  // Silently refresh token on mount if not present
  useEffect(() => {
    async function silentRefresh() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.accessToken);
      } catch (err) {
        console.error("Silent token refresh failed", err);
      } finally {
        setRefreshAttempted(true);
      }
    }
    if (!accessToken && !refreshAttempted) {
      silentRefresh();
    }
  }, [accessToken, refreshAttempted]);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
