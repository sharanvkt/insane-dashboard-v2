// app/page.js
"use client";

import { useAuth } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import { useState, useEffect } from "react";
import DomainModal from "./components/DomainModal";
import DomainGrid from "./components/DomainGrid";
import { Globe, LogOut, PlusCircle } from "lucide-react";

export default function Home() {
  const { user, logOut } = useAuth();
  const [isAddDomainModalOpen, setAddDomainModalOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Format current time
    const now = new Date();
    const options = { weekday: "long", month: "long", day: "numeric" };
    setCurrentTime(now.toLocaleDateString(undefined, options));
  }, []);

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
        {/* Top Navigation */}
        <nav className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-2">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                Insane Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden md:flex items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden mr-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || user.email}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {(user.email || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-neutral-300">{user.email}</span>
                </div>
              )}

              <button
                onClick={handleSignOut}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-sm transition-colors border border-neutral-700 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Log out
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-xl md:text-2xl font-medium text-white">
                  {greeting},{" "}
                  {user?.displayName || user?.email?.split("@")[0] || "User"}
                </h2>
                <p className="text-neutral-400 mt-1">{currentTime}</p>
              </div>

              <button
                onClick={() => setAddDomainModalOpen(true)}
                className="btn-primary mt-4 md:mt-0 px-5 py-2.5 rounded-lg flex items-center font-medium text-white"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New Landing Page
              </button>
            </div>

            {/* Spacer for better visual rhythm */}
            <div className="h-4"></div>
          </div>

          {/* Domains Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Your Domains</h2>
            </div>
          </div>

          {/* Domain Grid */}
          <DomainGrid userEmail={user?.email} />
        </div>

        {isAddDomainModalOpen && (
          <DomainModal onClose={() => setAddDomainModalOpen(false)} />
        )}
      </main>
    </AuthGuard>
  );
}
