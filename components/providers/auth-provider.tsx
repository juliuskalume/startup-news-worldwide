"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isPasswordAccount: boolean;
  requiresEmailVerification: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthErrorLike = {
  code?: string;
  message?: string;
};

function mapAuthError(error: unknown): string {
  const code = (error as AuthErrorLike)?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/missing-password":
      return "Please enter your password.";
    case "auth/email-already-in-use":
      return "This email is already registered. Try signing in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Authentication failed. Please try again.";
  }
}

function shouldFallbackToRedirect(error: unknown): boolean {
  const code = (error as AuthErrorLike)?.code ?? "";
  return (
    code === "auth/popup-blocked" ||
    code === "auth/popup-closed-by-user" ||
    code === "auth/operation-not-supported-in-this-environment" ||
    code === "auth/unauthorized-domain"
  );
}

function mapNativeGoogleError(error: unknown): string {
  const code = ((error as AuthErrorLike)?.code ?? "").toLowerCase();
  const message = ((error as AuthErrorLike)?.message ?? "").toLowerCase();

  if (code.includes("cancel") || message.includes("cancel")) {
    return "Google sign-in was cancelled.";
  }

  if (code.includes("network") || message.includes("network")) {
    return "Network error. Check your connection and try again.";
  }

  return "Google sign-in failed. Please try again.";
}

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setEmailVerified(nextUser?.emailVerified ?? false);
      setLoading(false);
    });

    if (!Capacitor.isNativePlatform()) {
      // Handle Google redirect flow on environments where popup is unsupported.
      void getRedirectResult(auth).catch(() => undefined);
    }

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(credential.user);
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    },
    []
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        setEmailVerified(credential.user.emailVerified);

        if (!credential.user.emailVerified) {
          await sendEmailVerification(credential.user);
        }
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await FirebaseAuthentication.signInWithGoogle({
          skipNativeAuth: true,
        });

        const idToken = result.credential?.idToken ?? null;
        const accessToken = result.credential?.accessToken ?? null;
        if (!idToken && !accessToken) {
          throw new Error("Google sign-in did not return a usable credential.");
        }

        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        await signInWithCredential(auth, credential);
        return;
      } catch (error) {
        throw new Error(mapNativeGoogleError(error));
      }
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (shouldFallbackToRedirect(error)) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw new Error(mapAuthError(error));
    }
  }, []);

  const resendVerificationEmail = useCallback(async (): Promise<void> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user.");
      }
      await sendEmailVerification(currentUser);
    } catch {
      throw new Error("Could not send verification email. Please try again.");
    }
  }, []);

  const refreshVerificationStatus = useCallback(async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }

    await reload(currentUser);
    setUser(auth.currentUser);
    const verified = auth.currentUser?.emailVerified ?? false;
    setEmailVerified(verified);
    return verified;
  }, []);

  const signOutUser = useCallback(async (): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut().catch(() => undefined);
    }

    await signOut(auth);
    setEmailVerified(false);
  }, []);

  const isPasswordAccount =
    user?.providerData.some((provider) => provider.providerId === "password") ?? false;
  const requiresEmailVerification = Boolean(user) && isPasswordAccount && !emailVerified;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isPasswordAccount,
      requiresEmailVerification,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      resendVerificationEmail,
      refreshVerificationStatus,
      signOutUser,
    }),
    [
      isPasswordAccount,
      loading,
      refreshVerificationStatus,
      requiresEmailVerification,
      resendVerificationEmail,
      signInWithEmail,
      signInWithGoogle,
      signOutUser,
      signUpWithEmail,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

