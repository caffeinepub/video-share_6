import { Link } from "@tanstack/react-router";
import { Upload, LogIn, LogOut, Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/assets/generated/logo-transparent.dim_80x80.png"
            alt="VidStream logo"
            className="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-display text-2xl tracking-widest text-foreground">
            VID<span className="text-primary">STREAM</span>
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <Link to="/upload">
            <Button
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow-sm"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Video</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="gap-2 border border-border hover:border-primary/60 hover:text-primary transition-colors"
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAuthenticated ? (
              <LogOut className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isLoggingIn ? "Signing in..." : isAuthenticated ? "Sign Out" : "Admin Login"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
