// app/components/SchedulePicker.js
"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, Repeat, X } from "lucide-react";

export default function SchedulePicker({ onSchedule, onCancel }) {
  const [scheduleType, setScheduleType] = useState("once");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recurrenceType, setRecurrenceType] = useState("daily");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();

    const scheduleData = {
      scheduleType,
      executeAt: selectedDate,
    };

    if (scheduleType === "recurring") {
      scheduleData.recurrence = {
        type: recurrenceType,
        interval: recurrenceInterval,
      };
    }

    onSchedule(scheduleData);
  };

  // Set minimum date to current time + 5 minutes
  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 5);

  // Function to filter out past times for today
  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDateOnly = new Date(selectedDate);

    // If the selected date is today, only show times after current time + 5 minutes
    if (
      selectedDateOnly.getDate() === currentDate.getDate() &&
      selectedDateOnly.getMonth() === currentDate.getMonth() &&
      selectedDateOnly.getFullYear() === currentDate.getFullYear()
    ) {
      const minTimeToday = new Date();
      minTimeToday.setMinutes(minTimeToday.getMinutes() + 5);
      return time.getTime() >= minTimeToday.getTime();
    }

    // For future dates, all times are allowed
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div
        className="relative bg-gradient-to-br from-neutral-800/95 to-neutral-900/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg border border-neutral-700/30 shadow-2xl"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-primary-500/5 pointer-events-none" />

        <div className="relative flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-xl mr-3">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              Schedule Update
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              Choose when to apply your changes
            </p>
          </div>
          <button
            onClick={onCancel}
            className="group p-2 rounded-full bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600/30 hover:border-neutral-500/50 transition-all duration-200"
          >
            <X className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-8">
          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-semibold text-neutral-200 mb-4">
              Schedule Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setScheduleType("once")}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 text-sm font-semibold ${
                  scheduleType === "once"
                    ? "bg-gradient-to-br from-primary-600 to-primary-700 border-primary-500/50 text-white shadow-lg shadow-primary-500/25"
                    : "bg-neutral-700/30 border-neutral-600/40 text-neutral-300 hover:bg-neutral-700/50 hover:border-neutral-500/50"
                }`}
              >
                <div
                  className={`p-2 rounded-xl mb-2 mx-auto w-fit ${
                    scheduleType === "once"
                      ? "bg-white/20"
                      : "bg-neutral-600/30"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                One-time
                <div className="text-xs opacity-75 mt-1">Execute once</div>
              </button>
              <button
                type="button"
                onClick={() => setScheduleType("recurring")}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 text-sm font-semibold ${
                  scheduleType === "recurring"
                    ? "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500/50 text-white shadow-lg shadow-purple-500/25"
                    : "bg-neutral-700/30 border-neutral-600/40 text-neutral-300 hover:bg-neutral-700/50 hover:border-neutral-500/50"
                }`}
              >
                <div
                  className={`p-2 rounded-xl mb-2 mx-auto w-fit ${
                    scheduleType === "recurring"
                      ? "bg-white/20"
                      : "bg-neutral-600/30"
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                </div>
                Recurring
                <div className="text-xs opacity-75 mt-1">
                  Repeat automatically
                </div>
              </button>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block text-sm font-semibold text-neutral-200 mb-3">
              {scheduleType === "once" ? "Execute At" : "First Execution"}
            </label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={minDate}
                minTime={
                  selectedDate.toDateString() === new Date().toDateString()
                    ? new Date(new Date().getTime() + 5 * 60 * 1000) // Current time + 5 minutes for today
                    : new Date(new Date().setHours(0, 0, 0, 0)) // Start of day for future dates
                }
                maxTime={new Date(new Date().setHours(23, 59, 59, 999))} // End of day
                filterTime={filterPassedTime}
                className="w-full p-4 bg-neutral-700/30 backdrop-blur-sm rounded-xl border border-neutral-600/40 focus:border-primary-500/60 focus:bg-neutral-700/50 transition-all duration-200 text-white placeholder-neutral-400 shadow-inner"
                calendarClassName="bg-neutral-800 border-neutral-600"
                popperClassName="z-50"
                excludeTimes={[]} // Can be used to exclude specific times if needed
                placeholderText="Select date and time"
              />
            </div>
          </div>

          {/* Recurrence Options */}
          {scheduleType === "recurring" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-200 mb-3">
                  Repeat Every
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={recurrenceInterval}
                    onChange={(e) =>
                      setRecurrenceInterval(parseInt(e.target.value) || 1)
                    }
                    className="w-24 p-4 bg-neutral-700/30 backdrop-blur-sm rounded-xl border border-neutral-600/40 focus:border-primary-500/60 focus:bg-neutral-700/50 transition-all duration-200 text-white text-center font-semibold shadow-inner"
                  />
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value)}
                    className="flex-1 p-4 bg-neutral-700/30 backdrop-blur-sm rounded-xl border border-neutral-600/40 focus:border-primary-500/60 focus:bg-neutral-700/50 transition-all duration-200 text-white font-medium shadow-inner"
                  >
                    <option value="daily">
                      Day{recurrenceInterval > 1 ? "s" : ""}
                    </option>
                    <option value="weekly">
                      Week{recurrenceInterval > 1 ? "s" : ""}
                    </option>
                    <option value="monthly">
                      Month{recurrenceInterval > 1 ? "s" : ""}
                    </option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="p-5 bg-gradient-to-r from-purple-500/10 to-primary-500/10 backdrop-blur-sm rounded-2xl border border-purple-500/20">
                <div className="flex items-start">
                  <div className="p-2 bg-purple-500/20 rounded-xl mr-3 flex-shrink-0">
                    <Repeat className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Schedule Preview
                    </h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      Updates every{" "}
                      <span className="font-medium text-white">
                        {recurrenceInterval} {recurrenceType.slice(0, -2)}
                        {recurrenceInterval > 1 ? "s" : ""}
                      </span>
                      , starting{" "}
                      <span className="font-medium text-white">
                        {selectedDate.toLocaleDateString()}
                      </span>{" "}
                      at{" "}
                      <span className="font-medium text-white">
                        {selectedDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-neutral-700/30">
            <button
              type="submit"
              className="group relative overflow-hidden flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">Schedule Update</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 backdrop-blur-sm text-neutral-300 hover:text-white rounded-xl font-semibold transition-all duration-200 border border-neutral-600/30 hover:border-neutral-500/50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
