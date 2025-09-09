// app/components/SchedulesList.js
"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Repeat, X, AlertCircle, Loader, Globe, Trash2 } from "lucide-react";
import { getScheduledUpdates, cancelScheduledUpdate } from "../lib/scheduler";
import { getRelativeTime } from "../lib/history";
import { hasAccessToDomain } from "../lib/permissions";
import { useAuth } from "../context/AuthContext";

export default function SchedulesList({ domains = [] }) {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingIds, setCancellingIds] = useState(new Set());

  useEffect(() => {
    loadSchedules();
  }, [domains, user]);

  const loadSchedules = async () => {
    if (!user?.email || domains.length === 0) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const allSchedules = [];
      
      // Get schedules for each domain the user has access to
      for (const domain of domains) {
        const hasAccess = hasAccessToDomain(user.email, domain.name);
        if (hasAccess) {
          const result = await getScheduledUpdates(domain.id);
          if (result.success) {
            // Add domain info to each schedule
            result.schedules.forEach(schedule => {
              allSchedules.push({
                ...schedule,
                domainName: domain.name,
                domainUrl: domain.url,
              });
            });
          }
        }
      }

      // Sort by execution time
      allSchedules.sort((a, b) => new Date(a.executeAt) - new Date(b.executeAt));
      setSchedules(allSchedules);
    } catch (err) {
      setError("Failed to load schedules");
      console.error("Error loading schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    setCancellingIds(prev => new Set([...prev, scheduleId]));

    try {
      const result = await cancelScheduledUpdate(scheduleId);
      if (result.success) {
        // Remove the cancelled schedule from the list
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      } else {
        setError("Failed to cancel schedule");
      }
    } catch (err) {
      setError("Failed to cancel schedule");
      console.error("Error cancelling schedule:", err);
    } finally {
      setCancellingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }
  };

  const formatUpdates = (updates) => {
    const fields = Object.keys(updates);
    if (fields.length === 0) return "No changes";
    
    const fieldNames = fields.map(field => {
      switch (field) {
        case 'content1': return 'Content 1';
        case 'content2': return 'Content 2';
        case 'content3': return 'Content 3';
        case 'content4': return 'Content 4';
        case 'name': return 'Name';
        case 'url': return 'URL';
        default: return field;
      }
    });
    
    return fieldNames.join(', ');
  };

  const renderSchedule = (schedule) => {
    const isCancelling = cancellingIds.has(schedule.id);
    const executeDate = new Date(schedule.executeAt);
    const isPastDue = executeDate < new Date();
    
    return (
      <div key={schedule.id} className="p-5 bg-neutral-700/30 rounded-xl border border-neutral-600/30 hover:border-neutral-600/50 transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            {/* Domain Info */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-neutral-600/30 rounded-lg">
                <Globe className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">{schedule.domainName}</h4>
                <p className="text-xs text-neutral-400">
                  {schedule.domainUrl?.replace(/^https?:\/\//, "")}
                </p>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1.5 text-neutral-300">
                  {schedule.scheduleType === "recurring" ? (
                    <Repeat className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-blue-400" />
                  )}
                  <span>
                    {schedule.scheduleType === "recurring" 
                      ? `Repeats ${schedule.recurrence?.type}ly` 
                      : "One-time"
                    }
                  </span>
                </div>
                
                <div className={`text-sm ${isPastDue ? 'text-yellow-400' : 'text-neutral-300'}`}>
                  {isPastDue ? 'Overdue: ' : ''}
                  {getRelativeTime(executeDate)}
                </div>
              </div>

              <div className="text-sm text-neutral-400">
                <span className="font-medium">Updates:</span> {formatUpdates(schedule.updates)}
              </div>

              <div className="text-xs text-neutral-500">
                Created by {schedule.createdBy} on {new Date(schedule.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => handleCancelSchedule(schedule.id)}
            disabled={isCancelling}
            className="ml-4 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cancel schedule"
          >
            {isCancelling ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Execution Time Details */}
        <div className="mt-4 pt-3 border-t border-neutral-600/30">
          <div className="flex items-center space-x-4 text-xs text-neutral-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>
                {executeDate.toLocaleDateString()} at {executeDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {schedule.scheduleType === "recurring" && schedule.recurrence && (
              <div className="text-purple-400">
                Every {schedule.recurrence.interval || 1} {schedule.recurrence.type.slice(0, -2)}
                {(schedule.recurrence.interval || 1) > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3 text-neutral-400">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Loading schedules...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3 text-red-400 bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="p-4 bg-neutral-700/30 rounded-xl mb-4 inline-block">
            <Calendar className="w-8 h-8 text-neutral-400" />
          </div>
          <h4 className="text-white font-medium mb-2">No upcoming schedules</h4>
          <p className="text-neutral-400 text-sm">
            Scheduled updates will appear here when you create them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-400 mb-6">
        Showing {schedules.length} upcoming schedule{schedules.length !== 1 ? 's' : ''}
      </div>
      {schedules.map(renderSchedule)}
    </div>
  );
}