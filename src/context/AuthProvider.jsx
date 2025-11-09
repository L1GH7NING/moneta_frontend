import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // NOTE: You need a backend endpoint like '/api/users/me' that returns
        // the current user's data if they are authenticated.
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (error) {
        // If the request fails (e.g., 401 Unauthorized), it means no valid session.
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;