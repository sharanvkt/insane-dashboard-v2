// app/components/DomainCard.js
"use client";

import { useState } from "react";
import DomainModal from "./DomainModal";

export default function DomainCard({ domain, onClick }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to get favicon URL
  const getFaviconUrl = (url) => {
    const domainWithoutProtocol = url.replace(/^https?:\/\//, "");
    return `https://www.google.com/s2/favicons?domain=${domainWithoutProtocol}&sz=64`;
  };

  return (
    <>
      <div
        className="bg-zinc-800 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] border border-zinc-700"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="p-4 flex items-center">
          <div className="w-12 h-12 mr-4 flex-shrink-0 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
            <img
              src={getFaviconUrl(domain.url)}
              alt={`${domain.name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-icon.svg";
              }}
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium text-lg">{domain.name}</h3>
            <p className="text-zinc-400 text-sm">{domain.url}</p>
            <p className="text-zinc-500 text-sm mt-1 line-clamp-1">
              {domain.content1 || "No content available"}
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <DomainModal
          domain={domain}
          onClose={() => setIsModalOpen(false)}
          isEditing={true}
        />
      )}
    </>
  );
}
