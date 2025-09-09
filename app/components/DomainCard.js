// app/components/DomainCard.js
"use client";

import { useState } from "react";
import DomainModal from "./DomainModal";
import DomainHistory from "./DomainHistory";
import { Globe, History } from "lucide-react";
import { getRelativeTime } from "../lib/history";

export default function DomainCard({ domain, onClick }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Format the domain URL for display
  const formatUrl = (url) => {
    return url?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "";
  };

  // Generate initial letter from domain name
  const getInitial = () => {
    if (!domain.name) return "A";
    return domain.name.charAt(0).toUpperCase();
  };

  return (
    <>
      <div
        className={`glass-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border ${
          isHovered ? "border-primary-600/50 shadow-xl shadow-primary-900/10 bg-neutral-800/80" : "border-neutral-700/50 shadow-md"
        }`}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-5 flex items-center space-x-4">
          <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center shadow-inner">
            <div className={`flex items-center justify-center w-full h-full ${isHovered ? "scale-110" : "scale-100"} transition-transform duration-300`}>
              <span className="text-neutral-400 text-2xl font-semibold">{getInitial()}</span>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium text-lg ${isHovered ? "text-primary-300" : "text-white"} transition-colors duration-300`}>
                {truncateText(domain.name, 20)}
              </h3>
              <div className="px-3 py-1 rounded-full bg-neutral-700/40 text-xs text-neutral-300">
                {domain.accessLevel || "Standard"}
              </div>
            </div>
            <p className="text-neutral-400 text-sm mt-1 flex items-center">
              <Globe className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
              {formatUrl(domain.url)}
            </p>
            <div className="mt-3 pt-3 border-t border-neutral-700/30 space-y-2">
              <p className="text-neutral-400 text-sm line-clamp-1">
                {domain.content1 || domain.date || "No content available"}
              </p>
              {domain.lastUpdated && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    Updated {getRelativeTime(domain.lastUpdated.toDate ? domain.lastUpdated.toDate() : new Date(domain.lastUpdated))} by {domain.updatedBy || 'unknown'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsHistoryOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-700/30 hover:bg-neutral-600/30 transition-colors duration-200 text-neutral-400 hover:text-white"
                    title="View history"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
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
      
      {isHistoryOpen && (
        <DomainHistory
          domainId={domain.id}
          domainName={domain.name}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </>
  );
}