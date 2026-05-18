import { useLayoutEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function ScrollToTopWhenReady() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  return null;
}

/**
 * Renders children only when user is logged in.
 * Otherwise redirects to /auth with ?redirect=<current path> so user returns here after login.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="relative flex h-11 w-11 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-primary/15" aria-hidden />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" aria-hidden />
          <Loader2 className="h-5 w-5 text-primary/90" aria-hidden />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace state={{ from: location }} />;
  }

  return (
    <>
      <ScrollToTopWhenReady />
      {children}
    </>
  );
}
