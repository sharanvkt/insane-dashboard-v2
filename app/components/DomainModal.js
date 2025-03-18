// app/components/DomainModal.js
"use client";

import { useState, useEffect } from "react";
import {
  db,
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "../lib/firebase";
import { X, Link, AlertCircle, Loader } from "lucide-react";

export default function DomainModal({ domain, onClose, isEditing = false }) {
  // Modal animation states
  const [isVisible, setIsVisible] = useState(false);

  // Form states
  const [name, setName] = useState(domain?.name || "");
  const [url, setUrl] = useState(
    domain?.url?.replace(/^https?:\/\//, "") || ""
  );
  const [content, setContent] = useState({
    content1: domain?.content1 || "",
    content2: domain?.content2 || "",
    content3: domain?.content3 || "",
    content4: domain?.content4 || "",
  });

  // UI states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Animation effect
  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      if (isEditing) {
        // Update existing domain
        const updates = {};

        // Only add fields that have values
        Object.keys(content).forEach((key) => {
          if (content[key]) {
            updates[key] = content[key];
          }
        });

        await updateDoc(doc(db, "Domains", domain.id), updates);
      } else {
        // Add new domain
        const domainData = {
          name,
          url: `https://${url}`,
          timestamp: Timestamp.fromDate(new Date()),
          ...content,
        };

        await addDoc(collection(db, "Domains"), domainData);
      }

      handleCloseWithAnimation();
    } catch (error) {
      console.error("Error saving domain:", error);
      setFormError("Failed to save domain. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "Domains", domain.id));
      handleCloseWithAnimation();
    } catch (error) {
      console.error("Error deleting domain:", error);
      setFormError("Failed to delete domain. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (field) => (e) => {
    setContent({ ...content, [field]: e.target.value });
  };

  const handleCloseWithAnimation = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div
      className={`fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) =>
        e.target === e.currentTarget && handleCloseWithAnimation()
      }
    >
      <div
        className={`bg-neutral-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-neutral-700/50 shadow-xl transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-8"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Domain" : "Add New Domain"}
          </h2>
          <button
            onClick={handleCloseWithAnimation}
            className="text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isEditing && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5 text-neutral-300">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-neutral-700/50 rounded-lg border border-neutral-600/50 focus:border-primary-500 transition-colors"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5 text-neutral-300">
                  Domain URL
                </label>
                <div className="flex">
                  <span className="bg-neutral-700 py-3 px-4 rounded-l-lg border border-neutral-600/50 border-r-0 text-neutral-400">
                    https://
                  </span>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 p-3 bg-neutral-700/50 rounded-r-lg border border-neutral-600/50 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {isEditing && (
            <div className="mb-6 p-3 bg-neutral-700/30 rounded-lg flex items-center">
              <Link className="w-5 h-5 mr-2 text-primary-400" />
              <p className="text-neutral-300 text-sm">
                <span className="font-medium">{domain.name}</span>
                <span className="text-neutral-400 ml-2">({domain.url})</span>
              </p>
            </div>
          )}

          {/* Content fields */}
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-medium text-neutral-300 mb-2">
              Content Fields
            </h3>
            {Object.keys(content).map((key, index) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-neutral-400">
                    Content {index + 1}
                  </label>
                  {isEditing && domain[key] && (
                    <span className="text-xs text-neutral-500">
                      Current value available
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={content[key]}
                  onChange={handleContentChange(key)}
                  className="w-full p-3 bg-neutral-700/50 rounded-lg border border-neutral-600/50 focus:border-primary-500 transition-colors"
                  placeholder={`Enter content ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <div className="space-x-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-5 py-2.5 rounded-lg font-medium text-white disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Processing...
                  </span>
                ) : isEditing ? (
                  "Update"
                ) : (
                  "Add Domain"
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseWithAnimation}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </form>

        {showConfirmation && (
          <div className="mt-6 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600/50">
            <p className="mb-4 text-neutral-300">
              Are you sure you want to delete this domain?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {isSubmitting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
