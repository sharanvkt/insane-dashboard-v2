// app/signin/page.js
"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, AlertCircle, Loader } from "lucide-react";

export default function SignIn() {
  const { googleSignIn, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && mounted) {
      router.push("/");
    }
  }, [user, router, mounted]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await googleSignIn();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 p-3 rounded-lg mb-4">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Insane Dashboard</h1>
          <p className="text-neutral-400">Sign in to access your dashboard</p>
        </div>

        {/* Sign-in Card */}
        <div className="glass-card rounded-xl p-6 border border-neutral-700/30 backdrop-blur-md shadow-lg">
          {error && (
            <div className="mb-6 p-3 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col">
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                    <AlertCircle className="h-6 w-6 text-neutral-700" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-300">
                      This is a secure dashboard for managing your landing
                      pages. Sign in to continue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="btn-primary w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center space-x-3 disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                      <path fill="none" d="M1 1h22v22H1z" />
                    </svg>
                  )}
                  <span>
                    {isLoading ? "Signing in..." : "Sign in with Google"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-sm">
            &copy; 2025 Insane Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
