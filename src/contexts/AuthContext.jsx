import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { validateAdmin, validateTeacher } from '@/lib/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const authStateRef = useRef(false);

  // Keep ref synced with state for use in event listeners
  useEffect(() => {
    authStateRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const restorePromise = new Promise((resolve) => {
          setTimeout(() => {
            const savedUser = localStorage.getItem('currentUser');
            resolve(savedUser ? JSON.parse(savedUser) : null);
          }, 50);
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth restore timeout')), 2000)
        );

        const userData = await Promise.race([restorePromise, timeoutPromise]);

        if (isMounted) {
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            console.log("Auth session restored");
          } else {
            console.log("Auth fallback to guest mode");
          }
        }
      } catch (error) {
        console.error("Session restore error:", error);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    restoreSession();

    // Security: Intercept browser back/forward navigation
    const handlePopState = () => {
      // If user uses back button while authenticated, force logout to prevent 
      // accessing potentially sensitive cached states.
      if (authStateRef.current) {
        console.warn("Security: Browser back button detected. Forcing logout.");
        performLogout();
        window.location.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Security: Detect if page was loaded via back/forward cache (bfcache)
    const checkNavigationType = () => {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0 && navEntries[0].type === "back_forward") {
        console.warn("Security: Back/forward navigation type detected. Forcing logout.");
        performLogout();
      }
    };
    
    checkNavigationType();

    return () => {
      isMounted = false;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const login = (username, password, role) => {
    let userData = null;

    if (role === 'admin') {
      userData = validateAdmin(username, password);
    } else if (role === 'teacher') {
      userData = validateTeacher(username, password);
    }

    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  // Centralized logout logic for security consistency
  const performLogout = () => {
    // Note: Supabase implementation would be `supabase.auth.signOut({ scope: 'global' })`
    // Using local simulation due to integration constraints.
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear all storage mechanisms to ensure complete session destruction
    localStorage.removeItem('currentUser');
    localStorage.removeItem('supabase.auth.token'); // Fallback cleanup
    sessionStorage.clear();
  };

  const logout = () => {
    performLogout();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};