"use client";

import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);

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

    // Eject the interceptor when the component unmounts or accessToken changes
    return () => axios.interceptors.request.eject(requestInterceptor);
  }, [accessToken]);

  // Response interceptor to refresh token on 401 errors
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // Check for 401 error and avoid infinite loops
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          process.env.NEXT_PUBLIC_BACKEND_URL // Ensure backend URL is set
        ) {
          originalRequest._retry = true;
          try {
            // Call the refresh token endpoint.
            // Assumes that your backend is using an HTTP-only cookie to send the refresh token.
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
              {},
              { withCredentials: true }
            );
            // Update the in-memory token
            setAccessToken(res.data.accessToken);
            // Set the new token and retry the original request
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${res.data.accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Optionally, handle logout or show a message if refresh fails.
            console.error(
              "Refresh token failed. Logging out user.",
              refreshError
            );
            // You might want to clear the token and redirect to login here.
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(responseInterceptor);
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easier access in your components
export function useAuth() {
  return useContext(AuthContext);
}
