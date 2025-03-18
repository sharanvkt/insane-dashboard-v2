// app/components/AuthGuard.js
"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, Loader } from "lucide-react";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/signin");
      } else {
        // Add a slight delay before showing content for smooth transition
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, router]);

  // If loading or not authenticated, show loading state
  if (loading || !user || isTransitioning) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-primary-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-neutral-900"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary-400" />
            </div>
          </div>
          <p className="mt-4 text-neutral-400 animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, render children with fade-in effect
  return (
    <div className="transition-opacity duration-500 ease-in-out opacity-100">
      {children}
    </div>
  );
}
