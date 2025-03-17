// app/signin/page.js
"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GoogleButton from "react-google-button";

export default function SignIn() {
  const { googleSignIn, user } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white text-black p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <div className="flex justify-center">
          <GoogleButton onClick={handleGoogleSignIn} />
        </div>
      </div>
    </div>
  );
}
