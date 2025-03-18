// app/components/DomainGrid.js
"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { hasAccessToDomain } from "../lib/permissions";
import DomainCard from "./DomainCard";

export default function DomainGrid({ userEmail }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    setLoading(true);
    try {
      const q = query(collection(db, "Domains"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let domainsData = [];
        querySnapshot.forEach((doc) => {
          domainsData.push({ id: doc.id, ...doc.data() });
        });

        // Filter domains based on user permissions
        if (userEmail) {
          domainsData = domainsData.filter((domain) =>
            hasAccessToDomain(userEmail, domain.name)
          );
        }

        setDomains(domainsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching domains:", error);
      setLoading(false);
    }
  }, [userEmail]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="bg-neutral-800/50 rounded-xl overflow-hidden animate-pulse h-36 border border-neutral-700/30"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          onClick={() => setSelectedDomain(domain)}
        />
      ))}

      {domains.length === 0 && (
        <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-800/80 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No domains available</h3>
          <p className="text-neutral-400 max-w-md mb-6">
            Get started by adding your first domain using the &ldquo;Add New Landing Page&rdquo; button above.
          </p>
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-ping mr-2"></div>
            <p className="text-primary-400 text-sm">Pro tip: You can add multiple custom content fields to each domain</p>
          </div>
        </div>
      )}
    </div>
  );
}