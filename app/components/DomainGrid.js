// app/components/DomainGrid.js
"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { hasAccessToDomain } from "../lib/permissions";
import DomainCard from "./DomainCard";

export default function DomainGrid({ userEmail }) {
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
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
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching domains:", error);
    }
  }, [userEmail]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          onClick={() => setSelectedDomain(domain)}
        />
      ))}

      {domains.length === 0 && (
        <div className="col-span-2 text-center py-12 text-gray-400">
          No domains available. Add your first domain by clicking "Add New LP"
          button.
        </div>
      )}
    </div>
  );
}
