import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/** Legacy / bookmarked callback URL — send users to /auth or their redirect target. */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const raw = searchParams.get("redirect");
    let target = "/";
    if (raw) {
      try {
        target = decodeURIComponent(raw);
      } catch {
        target = raw;
      }
    }
    if (!target.startsWith("/") || target === "/auth" || target.startsWith("/auth?")) {
      target = "/";
    }

    if (user) {
      navigate(target, { replace: true });
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(target)}`, { replace: true });
    }
  }, [user, loading, navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground font-medium">Redirecting…</p>
    </div>
  );
}
