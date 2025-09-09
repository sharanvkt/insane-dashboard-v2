// app/components/DomainHistory.js
"use client";

import { useState, useEffect } from "react";
import { X, History, Clock, User, AlertCircle, Loader, Edit, Plus, Trash2, Calendar, CalendarX, CalendarCheck } from "lucide-react";
import { getDomainHistory, formatChanges, getRelativeTime } from "../lib/history";
import { useAuth } from "../context/AuthContext";

export default function DomainHistory({ domainId, domainName, onClose }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, [domainId]);

  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getDomainHistory(domainId, user?.email);
      
      if (result.success) {
        setHistory(result.history);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load history");
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionInfo = (action) => {
    switch (action) {
      case "update":
        return {
          label: "Content Updated",
          icon: Edit,
          color: "blue",
          bgColor: "bg-blue-500/20",
          iconColor: "text-blue-400"
        };
      case "create":
        return {
          label: "Domain Created", 
          icon: Plus,
          color: "green",
          bgColor: "bg-green-500/20",
          iconColor: "text-green-400"
        };
      case "delete":
        return {
          label: "Domain Deleted",
          icon: Trash2,
          color: "red", 
          bgColor: "bg-red-500/20",
          iconColor: "text-red-400"
        };
      case "schedule_create":
        return {
          label: "Schedule Created",
          icon: Calendar,
          color: "purple",
          bgColor: "bg-purple-500/20", 
          iconColor: "text-purple-400"
        };
      case "schedule_cancel":
        return {
          label: "Schedule Cancelled",
          icon: CalendarX,
          color: "orange",
          bgColor: "bg-orange-500/20",
          iconColor: "text-orange-400"
        };
      case "scheduled_update":
        return {
          label: "Scheduled Update Applied",
          icon: CalendarCheck,
          color: "indigo",
          bgColor: "bg-indigo-500/20",
          iconColor: "text-indigo-400"
        };
      default:
        return {
          label: "Unknown Action",
          icon: History,
          color: "gray",
          bgColor: "bg-gray-500/20",
          iconColor: "text-gray-400"
        };
    }
  };

  const renderChange = (change) => {
    const formatted = formatChanges(change.changes);
    const actionInfo = getActionInfo(change.action);
    const ActionIcon = actionInfo.icon;
    
    return (
      <div key={change.id} className="p-4 bg-neutral-700/30 rounded-xl border border-neutral-600/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 ${actionInfo.bgColor} rounded-lg`}>
              <ActionIcon className={`w-4 h-4 ${actionInfo.iconColor}`} />
            </div>
            <span className="text-sm font-medium text-white">
              {actionInfo.label}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-neutral-400">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{change.updatedBy}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{getRelativeTime(change.updatedAt)}</span>
            </div>
          </div>
        </div>
        
        {formatted.length > 0 && (
          <div className="space-y-2">
            {formatted.map((item, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-neutral-200 mb-1">
                  {item.field}
                </div>
                {item.old && (
                  <div className="pl-3 border-l-2 border-red-400/30 bg-red-400/5 rounded-r-md p-2 mb-2">
                    <div className="text-xs text-red-300 mb-1">Previous:</div>
                    <div className="text-neutral-300 text-xs break-words">
                      {item.old.length > 100 ? `${item.old.substring(0, 100)}...` : item.old}
                    </div>
                  </div>
                )}
                <div className="pl-3 border-l-2 border-green-400/30 bg-green-400/5 rounded-r-md p-2">
                  <div className="text-xs text-green-300 mb-1">New:</div>
                  <div className="text-neutral-300 text-xs break-words">
                    {item.new.length > 100 ? `${item.new.substring(0, 100)}...` : item.new}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div
        className="relative bg-gradient-to-br from-neutral-800/95 to-neutral-900/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl max-h-[90vh] border border-neutral-700/30 shadow-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-primary-500/5 pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex justify-between items-center p-8 border-b border-neutral-700/30">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-xl mr-3">
                  <History className="w-5 h-5 text-purple-400" />
                </div>
                Change History
              </h3>
              <p className="text-neutral-400 text-sm mt-1">
                {domainName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="group p-2 rounded-full bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600/30 hover:border-neutral-500/50 transition-all duration-200"
            >
              <X className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3 text-neutral-400">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Loading history...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3 text-red-400 bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {!loading && !error && history.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="p-4 bg-neutral-700/30 rounded-xl mb-4 inline-block">
                    <History className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h4 className="text-white font-medium mb-2">No history available</h4>
                  <p className="text-neutral-400 text-sm">
                    Changes will appear here once this domain is updated.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && history.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-neutral-400 mb-6">
                  Showing {history.length} change{history.length !== 1 ? 's' : ''}
                </div>
                {history.map(renderChange)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}