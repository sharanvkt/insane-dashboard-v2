// app/components/DomainModal.js
"use client";

import { useState } from "react";
import {
  db,
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "../lib/firebase";

export default function DomainModal({ domain, onClose, isEditing = false }) {
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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      onClose();
    } catch (error) {
      console.error("Error saving domain:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "Domains", domain.id));
      onClose();
    } catch (error) {
      console.error("Error deleting domain:", error);
    }
  };

  const handleContentChange = (field) => (e) => {
    setContent({ ...content, [field]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Domain" : "Add New Domain"}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isEditing && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-zinc-700 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Domain URL
                </label>
                <div className="flex">
                  <span className="bg-zinc-700 p-2 rounded-l-md border-r border-zinc-600">
                    https://
                  </span>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 p-2 bg-zinc-700 rounded-r-md"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {isEditing && (
            <div className="mb-4">
              <p className="text-zinc-400">URL: {domain.url}</p>
            </div>
          )}

          {/* Content fields */}
          {Object.keys(content).map((key, index) => (
            <div className="mb-4" key={key}>
              <label className="block text-sm font-medium mb-1">
                Content {index + 1}
                {isEditing && domain[key] && (
                  <span className="text-zinc-400 ml-2">
                    Current: {domain[key] || "None"}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={content[key]}
                onChange={handleContentChange(key)}
                className="w-full p-2 bg-zinc-700 rounded-md"
                placeholder={`Enter content ${index + 1}`}
              />
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mr-2"
              >
                {isEditing ? "Update" : "Add Domain"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            )}
          </div>
        </form>

        {showConfirmation && (
          <div className="mt-4 p-4 bg-zinc-700 rounded-md">
            <p className="mb-4">Are you sure you want to delete this domain?</p>
            <div className="flex">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md mr-2"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-zinc-600 hover:bg-zinc-500 text-white px-4 py-2 rounded-md"
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
