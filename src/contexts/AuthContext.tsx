import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirebaseAuth } from "@/integrations/firebase/config";

/** Comma-separated list of admin emails (env: VITE_ADMIN_EMAILS). First entry is default admin. */
const DEFAULT_ADMIN_EMAILS = ["amanvverma109@gmail.com"];

function getAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS;
  const fromEnv = raw && typeof raw === "string"
    ? raw.split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ADMIN_EMAILS;
}

interface AuthContextType {
  user: User | null;
  session: null;
  loading: boolean;
  isAdmin: boolean;
  /** Set when Google sign-in fails (e.g. user cancelled popup). Clear after reading. */
  redirectError: Error | null;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  clearRedirectError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectError, setRedirectError] = useState<Error | null>(null);
  const auth = getFirebaseAuth();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // Listener first so we always get auth state and loading becomes false
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // After Google redirect, getRedirectResult() applies the sign-in; then listener will fire with user
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setRedirectError(null);
          setUser(result.user);
          setLoading(false);
        }
      })
      .catch((err) => setRedirectError(err as Error));

    return () => unsubscribe();
  }, [auth]);

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, provider);
          return { error: null };
        } catch (redirectErr) {
          setRedirectError(redirectErr as Error);
          return { error: redirectErr as Error };
        }
      }
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setRedirectError(err as Error);
      }
      return { error: err as Error };
    }
  };

  const clearRedirectError = useCallback(() => setRedirectError(null), []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const adminEmails = getAdminEmails();
  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        loading,
        isAdmin,
        redirectError,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        clearRedirectError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
