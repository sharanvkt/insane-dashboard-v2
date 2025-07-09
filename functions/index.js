const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Main scheduler function - runs every 5 minutes to check for pending updates
exports.processScheduledUpdates = onSchedule(
  "every 5 minutes",
  async (event) => {
    console.log("Processing scheduled updates...");

    try {
      const now = admin.firestore.Timestamp.now();

      // Query for pending updates that should be executed
      const query = db
        .collection("ScheduledUpdates")
        .where("status", "==", "pending")
        .where("executeAt", "<=", now);

      const snapshot = await query.get();

      if (snapshot.empty) {
        console.log("No scheduled updates to process");
        return null;
      }

      console.log(`Found ${snapshot.size} scheduled updates to process`);

      // Process each scheduled update
      for (const doc of snapshot.docs) {
        const scheduleData = doc.data();
        await processUpdate(doc.id, scheduleData);
      }

      console.log("All scheduled updates processed");
      return null;
    } catch (error) {
      console.error("Error processing scheduled updates:", error);
      return null;
    }
  }
);

// Process a single scheduled update
async function processUpdate(scheduleId, scheduleData) {
  const { domainId, updates, scheduleType, recurrence } = scheduleData;

  try {
    console.log(`Processing update for domain ${domainId}`);

    // Update the domain document
    await db
      .collection("Domains")
      .doc(domainId)
      .update({
        ...updates,
        lastUpdated: admin.firestore.Timestamp.now(),
        updatedBy: "scheduled_update",
      });

    // Handle recurring vs one-time updates
    if (scheduleType === "recurring" && recurrence) {
      // Calculate next execution time
      const currentExecuteAt = scheduleData.executeAt.toDate();
      const nextExecuteAt = calculateNextExecution(
        currentExecuteAt,
        recurrence
      );

      // Update the schedule for next execution
      await db
        .collection("ScheduledUpdates")
        .doc(scheduleId)
        .update({
          executeAt: admin.firestore.Timestamp.fromDate(nextExecuteAt),
          lastExecuted: admin.firestore.Timestamp.now(),
        });

      console.log(
        `Recurring update scheduled for next execution: ${nextExecuteAt}`
      );
    } else {
      // Mark one-time update as completed
      await db.collection("ScheduledUpdates").doc(scheduleId).update({
        status: "completed",
        completedAt: admin.firestore.Timestamp.now(),
      });

      console.log(`One-time update completed for schedule ${scheduleId}`);
    }
  } catch (error) {
    console.error(`Error processing update ${scheduleId}:`, error);

    // Mark as failed
    await db.collection("ScheduledUpdates").doc(scheduleId).update({
      status: "failed",
      error: error.message,
      failedAt: admin.firestore.Timestamp.now(),
    });
  }
}

// Calculate next execution time for recurring updates
function calculateNextExecution(currentDate, recurrence) {
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
