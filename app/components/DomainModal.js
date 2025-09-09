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
import { X, Link, AlertCircle, Loader, Clock, Calendar } from "lucide-react";
import SchedulePicker from "./SchedulePicker";
import { createScheduledUpdate, validateScheduleData } from "../lib/scheduler";
import { createHistoryRecord, calculateChanges } from "../lib/history";
import { useAuth } from "../context/AuthContext";

export default function DomainModal({ domain, onClose, isEditing = false }) {
  const { user } = useAuth();

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
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [updateMode, setUpdateMode] = useState("now"); // "now" or "schedule"

  // Animation effect
  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (updateMode === "schedule") {
      setShowSchedulePicker(true);
      return;
    }

    // Handle immediate update
    await processUpdate();
  };

  const processUpdate = async () => {
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

        // Calculate changes for history
        console.log("DEBUG: Original domain data:", domain);
        console.log("DEBUG: Content state:", content);
        console.log("DEBUG: Updates to apply:", updates);
        
        const oldData = {
          name: domain.name || "",
          url: domain.url || "",
          content1: domain.content1 || "",
          content2: domain.content2 || "",
          content3: domain.content3 || "",
          content4: domain.content4 || ""
        };
        
        const newData = {
          name: domain.name || "",
          url: domain.url || "",
          content1: content.content1 || "",
          content2: content.content2 || "",
          content3: content.content3 || "",
          content4: content.content4 || ""
        };
        
        console.log("DEBUG: Old data for comparison:", oldData);
        console.log("DEBUG: New data for comparison:", newData);
        
        const changes = calculateChanges(oldData, newData);
        console.log("DEBUG: Calculated changes:", changes);
        
        // Add audit fields
        updates.lastUpdated = Timestamp.fromDate(new Date());
        updates.updatedBy = user?.email || "unknown";

        await updateDoc(doc(db, "Domains", domain.id), updates);
        
        // Create history record - for now, always create to test
        console.log("DEBUG: Creating history record...");
        try {
          const historyResult = await createHistoryRecord({
            domainId: domain.id,
            changes,
            updatedBy: user?.email || "unknown",
            action: "update"
          });
          console.log("DEBUG: History record result:", historyResult);
        } catch (historyError) {
          console.error("DEBUG: History creation failed:", historyError);
        }
      } else {
        // Add new domain
        const domainData = {
          name,
          url: `https://${url}`,
          timestamp: Timestamp.fromDate(new Date()),
          lastUpdated: Timestamp.fromDate(new Date()),
          updatedBy: user?.email || "unknown",
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

  const handleScheduleSubmit = async (scheduleData) => {
    setIsSubmitting(true);
    setFormError("");

    try {
      console.log("User object:", user);
      console.log("User email:", user?.email);
      console.log("Schedule data:", scheduleData);

      // Validate schedule data
      const validation = validateScheduleData(scheduleData);
      if (!validation.valid) {
        setFormError(validation.error);
        return;
      }

      if (!isEditing) {
        setFormError(
          "Scheduling is only available when editing existing domains."
        );
        return;
      }

      // Prepare updates object (only fields with values)
      const updates = {};
      Object.keys(content).forEach((key) => {
        if (content[key]) {
          updates[key] = content[key];
        }
      });

      console.log("Updates to schedule:", updates);

      // Create scheduled update
      const result = await createScheduledUpdate({
        domainId: domain.id,
        updates,
        scheduleType: scheduleData.scheduleType,
        executeAt: scheduleData.executeAt,
        recurrence: scheduleData.recurrence,
        createdBy: user?.email || "unknown",
      });

      console.log("Schedule result:", result);

      if (result.success) {
        handleCloseWithAnimation();
      } else {
        setFormError(result.error || "Failed to schedule update");
      }
    } catch (error) {
      console.error("Error scheduling update:", error);
      setFormError("Failed to schedule update. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowSchedulePicker(false);
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
      className={`fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) =>
        e.target === e.currentTarget && handleCloseWithAnimation()
      }
    >
      <div
        className={`relative bg-gradient-to-br from-neutral-800/95 to-neutral-900/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-700/30 shadow-2xl transition-all duration-500 ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
        }`}
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Gradient overlay for premium feel */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/5 to-purple-500/5 pointer-events-none" />

        {/* Header */}
        <div className="relative flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              {isEditing ? "Edit Domain" : "Add New Domain"}
            </h2>
            <p className="text-neutral-400 text-sm mt-1">
              {isEditing
                ? "Update your domain content and settings"
                : "Create a new domain with custom content"}
            </p>
          </div>
          <button
            onClick={handleCloseWithAnimation}
            className="group p-2 rounded-full bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600/30 hover:border-neutral-500/50 transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {formError && (
          <div className="relative mb-6 p-4 bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-500/20 rounded-2xl text-rose-300 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-2xl bg-rose-500/5" />
            <div className="relative flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-rose-400" />
              <span className="text-sm leading-relaxed">{formError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-6">
          {!isEditing && (
            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold mb-3 text-neutral-200 group-focus-within:text-primary-400 transition-colors">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-neutral-700/30 backdrop-blur-sm rounded-xl border border-neutral-600/40 focus:border-primary-500/60 focus:bg-neutral-700/50 transition-all duration-200 text-white placeholder-neutral-400 shadow-inner"
                  placeholder="Enter domain name"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold mb-3 text-neutral-200 group-focus-within:text-primary-400 transition-colors">
                  Domain URL
                </label>
                <div className="flex rounded-xl overflow-hidden border border-neutral-600/40 focus-within:border-primary-500/60 transition-all duration-200 shadow-inner">
                  <span className="bg-neutral-700/50 backdrop-blur-sm py-4 px-5 text-neutral-300 font-medium border-r border-neutral-600/40">
                    https://
                  </span>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 p-4 bg-neutral-700/30 backdrop-blur-sm text-white placeholder-neutral-400 focus:bg-neutral-700/50 transition-all duration-200 outline-none"
                    placeholder="example.com"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="mb-8 p-5 bg-gradient-to-r from-primary-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl border border-primary-500/20">
              <div className="flex items-center">
                <div className="p-2 bg-primary-500/20 rounded-xl mr-4">
                  <Link className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{domain.name}</p>
                  <p className="text-sm text-neutral-400">{domain.url}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content fields */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Content Fields
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-600/50 to-transparent ml-4"></div>
            </div>

            <div className="grid gap-6">
              {Object.keys(content).map((key, index) => (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-semibold text-neutral-200 group-focus-within:text-primary-400 transition-colors">
                      Content {index + 1}
                    </label>
                    {isEditing && domain[key] && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Current value available
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={content[key]}
                    onChange={handleContentChange(key)}
                    className="w-full p-4 bg-neutral-700/30 backdrop-blur-sm rounded-xl border border-neutral-600/40 focus:border-primary-500/60 focus:bg-neutral-700/50 transition-all duration-200 text-white placeholder-neutral-400 shadow-inner"
                    placeholder={`Enter content ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-neutral-700/30">
            <div className="flex space-x-3">
              {isEditing ? (
                // Show scheduling options for editing existing domains
                <>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => setUpdateMode("now")}
                    className="group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg hover:shadow-primary-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {isSubmitting && updateMode === "now" ? (
                      <span className="flex items-center relative z-10">
                        <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center relative z-10">
                        <Clock className="w-4 h-4 mr-2" />
                        Update Now
                      </span>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => setUpdateMode("schedule")}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {isSubmitting && updateMode === "schedule" ? (
                      <span className="flex items-center relative z-10">
                        <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Scheduling...
                      </span>
                    ) : (
                      <span className="flex items-center relative z-10">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule for Later
                      </span>
                    )}
                  </button>
                </>
              ) : (
                // Show only "Add Domain" for new domains
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 px-8 py-3 rounded-xl font-semibold text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-primary-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative z-10">
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Processing...
                      </span>
                    ) : (
                      "Add Domain"
                    )}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseWithAnimation}
                className="bg-neutral-700/50 hover:bg-neutral-600/50 backdrop-blur-sm text-neutral-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-neutral-600/30 hover:border-neutral-500/50"
              >
                Cancel
              </button>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="group bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/50 px-5 py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm"
              >
                <span className="flex items-center">Delete</span>
              </button>
            )}
          </div>
        </form>

        {showConfirmation && (
          <div className="mt-8 p-6 bg-gradient-to-r from-rose-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl border border-rose-500/20">
            <div className="flex items-start">
              <div className="p-2 bg-rose-500/20 rounded-xl mr-4 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">Delete Domain</h4>
                <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
                  Are you sure you want to delete this domain? This action
                  cannot be undone and will permanently remove all associated
                  data.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-70 shadow-lg hover:shadow-rose-500/25"
                  >
                    {isSubmitting ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 border border-neutral-600/30 hover:border-neutral-500/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Picker Modal */}
      {showSchedulePicker && (
        <SchedulePicker
          onSchedule={handleScheduleSubmit}
          onCancel={() => setShowSchedulePicker(false)}
        />
      )}
    </div>
  );
}
