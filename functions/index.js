const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

// History tracking utilities for Cloud Functions
const HISTORY_FIELDS = ['name', 'url', 'content1', 'content2', 'content3', 'content4'];

// Helper function to calculate changes (Cloud Functions version)
function calculateChanges(oldData, newData) {
  const changes = {};
  
  HISTORY_FIELDS.forEach(field => {
    const oldValue = (oldData[field] || "").toString().trim();
    const newValue = (newData[field] || "").toString().trim();
    
    if (oldValue !== newValue) {
      changes[field] = {
        old: oldValue,
        new: newValue
      };
    }
  });
  
  return changes;
}

// Helper function to create history record (Cloud Functions version)
async function createHistoryRecord({ domainId, changes, updatedBy, action }) {
  try {
    const historyData = {
      domainId,
      changes,
      updatedBy,
      action,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await db.collection("DomainHistory").add(historyData);
    console.log(`History record created for domain ${domainId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating history record:", error);
    return { success: false, error: error.message };
  }
}

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
  const { domainId, updates, scheduleType, recurrence, createdBy } = scheduleData;

  try {
    console.log(`Processing update for domain ${domainId}`);

    // Get current domain data for history tracking
    console.log(`DEBUG: Fetching current data for domain ${domainId}`);
    const domainDoc = await db.collection("Domains").doc(domainId).get();
    if (!domainDoc.exists) {
      throw new Error(`Domain ${domainId} not found`);
    }
    
    const oldData = domainDoc.data();
    console.log(`DEBUG: Old domain data:`, {
      name: oldData.name,
      url: oldData.url, 
      content1: oldData.content1?.substring(0, 50) + '...',
      content2: oldData.content2?.substring(0, 50) + '...',
      content3: oldData.content3?.substring(0, 50) + '...',
      content4: oldData.content4?.substring(0, 50) + '...'
    });
    
    console.log(`DEBUG: Updates to apply:`, updates);
    const newData = { ...oldData, ...updates };
    
    // Calculate changes for history
    const changes = calculateChanges(oldData, newData);
    console.log(`DEBUG: Changes calculated:`, changes);
    console.log(`DEBUG: Number of changes detected: ${Object.keys(changes).length}`);

    // Update the domain document
    const domainUpdates = {
      ...updates,
      lastUpdated: admin.firestore.Timestamp.now(),
      updatedBy: "scheduled_update",
    };
    
    await db
      .collection("Domains")
      .doc(domainId)
      .update(domainUpdates);
    
    // Create history record for the scheduled update
    if (Object.keys(changes).length > 0) {
      console.log(`DEBUG: Creating history record for ${Object.keys(changes).length} changes`);
      try {
        const historyResult = await createHistoryRecord({
          domainId,
          changes,
          updatedBy: `scheduled_update (created by ${createdBy || 'unknown'})`,
          action: "scheduled_update"
        });
        console.log(`DEBUG: History record created successfully:`, historyResult);
      } catch (historyError) {
        console.error(`ERROR: Failed to create history record for domain ${domainId}:`, historyError);
        // Don't throw - continue with the scheduled update even if history fails
      }
    } else {
      console.log(`DEBUG: No changes detected for domain ${domainId}, skipping history record`);
      console.log(`DEBUG: Old data fields:`, Object.keys(oldData));
      console.log(`DEBUG: Update fields:`, Object.keys(updates));
    }

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
