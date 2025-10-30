import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  email: string | null;
  sessionId: string;
  isAuthenticated: boolean;
  setEmail: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [email, setEmailState] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedSessionId = localStorage.getItem("session_id");

    if (storedEmail) {
      setEmailState(storedEmail);
    }

    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      // Generate new session ID if none exists
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      localStorage.setItem("session_id", newSessionId);
    }
  }, []);

  const setEmail = async (newEmail: string) => {
    try {
      // Call API to log email entry
      const response = await fetch("/.netlify/functions/log-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail,
          sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to log email");
      }

      // Store email in state and localStorage
      setEmailState(newEmail);
      localStorage.setItem("user_email", newEmail);
    } catch (error) {
      console.error("Error logging email:", error);
      throw error;
    }
  };

  const logout = () => {
    setEmailState(null);
    localStorage.removeItem("user_email");
    // Keep session ID for new email entry
  };

  const isAuthenticated = !!email;

  return (
    <AuthContext.Provider
      value={{ email, sessionId, isAuthenticated, setEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
