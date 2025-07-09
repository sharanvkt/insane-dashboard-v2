// app/lib/scheduler.js
import {
  db,
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "./firebase";

// Create a new scheduled update
export async function createScheduledUpdate({
  domainId,
  updates,
  scheduleType,
  executeAt,
  recurrence = null,
  createdBy,
}) {
  try {
    const scheduleData = {
      domainId,
      updates,
      scheduleType, // "once" or "recurring"
      executeAt: Timestamp.fromDate(executeAt),
      status: "pending",
      createdBy,
      createdAt: Timestamp.fromDate(new Date()),
    };

    // Add recurrence data if it's a recurring schedule
    if (scheduleType === "recurring" && recurrence) {
      scheduleData.recurrence = recurrence;
    }

    const docRef = await addDoc(
      collection(db, "ScheduledUpdates"),
      scheduleData
    );
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating scheduled update:", error);
    return { success: false, error: error.message };
  }
}

// Get scheduled updates for a domain
export async function getScheduledUpdates(domainId) {
  try {
    const q = query(
      collection(db, "ScheduledUpdates"),
      where("domainId", "==", domainId),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);
    const schedules = [];

    querySnapshot.forEach((doc) => {
      schedules.push({
        id: doc.id,
        ...doc.data(),
        executeAt: doc.data().executeAt.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      });
    });

    return { success: true, schedules };
  } catch (error) {
    console.error("Error getting scheduled updates:", error);
    return { success: false, error: error.message };
  }
}

// Cancel a scheduled update
export async function cancelScheduledUpdate(scheduleId) {
  try {
    await updateDoc(doc(db, "ScheduledUpdates", scheduleId), {
      status: "cancelled",
      cancelledAt: Timestamp.fromDate(new Date()),
    });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling scheduled update:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to calculate next execution time for recurring updates
export function calculateNextExecution(recurrence, currentDate = new Date()) {
  const { type, interval = 1 } = recurrence;
  const nextDate = new Date(currentDate);

  switch (type) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7 * interval);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    default:
      throw new Error(`Unsupported recurrence type: ${type}`);
  }

  return nextDate;
}

// Validate schedule data
export function validateScheduleData({ executeAt, scheduleType, recurrence }) {
  const now = new Date();

  // Check if execution time is in the future
  if (executeAt <= now) {
    return { valid: false, error: "Execution time must be in the future" };
  }

  // Validate recurring schedule
  if (scheduleType === "recurring") {
    if (!recurrence || !recurrence.type) {
      return {
        valid: false,
        error: "Recurrence type is required for recurring schedules",
      };
    }

    if (!["daily", "weekly", "monthly"].includes(recurrence.type)) {
      return { valid: false, error: "Invalid recurrence type" };
    }

    if (recurrence.interval && recurrence.interval < 1) {
      return { valid: false, error: "Recurrence interval must be at least 1" };
    }
  }

  return { valid: true };
}
