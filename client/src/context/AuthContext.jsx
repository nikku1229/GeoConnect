import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("userId");
    return storedUser ? storedUser : null;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(storedUser);
    } else {
      logout();
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
