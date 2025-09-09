// app/lib/history.js
import {
  db,
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "./firebase";
import { hasAccessToDomain } from "./permissions";

// Create a history record for domain changes
export async function createHistoryRecord({
  domainId,
  changes,
  updatedBy,
  action = "update"
}) {
  try {
    const historyData = {
      domainId,
      changes,
      updatedBy,
      action,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    const docRef = await addDoc(
      collection(db, "DomainHistory"),
      historyData
    );
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating history record:", error);
    return { success: false, error: error.message };
  }
}

// Get domain history with access control
export async function getDomainHistory(domainId, userEmail) {
  try {
    // Get domain name to check access
    const domainDoc = await getDoc(doc(db, "Domains", domainId));
    if (!domainDoc.exists()) {
      return { success: false, error: "Domain not found" };
    }
    
    const domainName = domainDoc.data().name;
    const hasAccess = hasAccessToDomain(userEmail, domainName);
    if (!hasAccess) {
      return { success: false, error: "Access denied" };
    }

    const q = query(
      collection(db, "DomainHistory"),
      where("domainId", "==", domainId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const history = [];

    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt.toDate(),
      });
    });

    return { success: true, history };
  } catch (error) {
    console.error("Error getting domain history:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to calculate what changed between old and new data
export function calculateChanges(oldData, newData) {
  const changes = {};
  const fields = ['name', 'url', 'content1', 'content2', 'content3', 'content4'];

  console.log("DEBUG calculateChanges: Starting comparison");
  console.log("DEBUG calculateChanges: oldData =", oldData);
  console.log("DEBUG calculateChanges: newData =", newData);

  fields.forEach(field => {
    // Normalize values - treat empty strings, null, and undefined as equivalent
    const oldValue = (oldData[field] || "").toString().trim();
    const newValue = (newData[field] || "").toString().trim();
    
    console.log(`DEBUG calculateChanges: ${field}: "${oldValue}" vs "${newValue}"`);
    
    if (oldValue !== newValue) {
      console.log(`DEBUG calculateChanges: Change detected in ${field}`);
      changes[field] = {
        old: oldValue,
        new: newValue
      };
    }
  });

  console.log("DEBUG calculateChanges: Final changes =", changes);
  return changes;
}

// Helper function to format changes for display
export function formatChanges(changes) {
  const formatted = [];
  
  Object.entries(changes).forEach(([field, change]) => {
    const fieldName = field === 'url' ? 'URL' : field.charAt(0).toUpperCase() + field.slice(1);
    formatted.push({
      field: fieldName,
      old: change.old,
      new: change.new
    });
  });

  return formatted;
}

// Helper function for relative time formatting
export function getRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}