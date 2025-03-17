// app/page.js
"use client";

import { useAuth } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import { useState } from "react";
import DomainModal from "./components/DomainModal";
import DomainGrid from "./components/DomainGrid";

export default function Home() {
  const { user, logOut } = useAuth();
  const [isAddDomainModalOpen, setAddDomainModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthGuard>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Insane Landing Page Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setAddDomainModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Add New LP
            </button>
            <button
              onClick={handleSignOut}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <DomainGrid userEmail={user?.email} />

        {isAddDomainModalOpen && (
          <DomainModal onClose={() => setAddDomainModalOpen(false)} />
        )}
      </main>
    </AuthGuard>
  );
}
