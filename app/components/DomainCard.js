// app/components/DomainCard.js
"use client";

import { useState } from "react";
import DomainModal from "./DomainModal";
import { Globe } from "lucide-react";
import Image from "next/image";

export default function DomainCard({ domain, onClick }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Function to get favicon URL
  const getFaviconUrl = (url) => {
    const domainWithoutProtocol = url.replace(/^https?:\/\//, "");
    return `https://www.google.com/s2/favicons?domain=${domainWithoutProtocol}&sz=64`;
  };

  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Format the domain URL for display
  const formatUrl = (url) => {
    return url?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "";
  };

  return (
    <>
      <div
        className={`glass-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border ${
          isHovered
            ? "border-primary-600/50 shadow-xl shadow-primary-900/10 bg-neutral-800/80"
            : "border-neutral-700/50 shadow-md"
        }`}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-5 flex items-center space-x-4">
          <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-700/50 flex items-center justify-center shadow-inner">
            {imageError ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <Globe className="h-8 w-8 text-neutral-500" />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={getFaviconUrl(domain.url)}
                  alt={`${domain.name} logo`}
                  className="object-cover transition-transform duration-300"
                  style={{ transform: isHovered ? "scale(1.08)" : "scale(1)" }}
                  onError={() => setImageError(true)}
                  fill
                  sizes="56px"
                />
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h3
                className={`font-medium text-lg ${
                  isHovered ? "text-primary-300" : "text-white"
                } transition-colors duration-300`}
              >
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
            <div className="mt-3 pt-3 border-t border-neutral-700/30">
              <p className="text-neutral-400 text-sm line-clamp-1">
                {domain.content1 || "No content available"}
              </p>
            </div>
            {/* Content bottom area - remains empty to maintain spacing */}
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
