// app/lib/permissions.js
export const userPermissions = {
  "sharan@gmail.com": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "sharanvkt@gmail.com": {
    role: "editor",
    access: "specific",
    domains: ["Ankit Batra"], // Access limited to specific domain(s)
  },
};

// Helper function to check user permissions
export function getUserPermissions(email) {
  return userPermissions[email] || { role: "viewer", access: "none" };
}

// Helper to check if a user has access to a specific domain
export function hasAccessToDomain(email, domainName) {
  const permissions = getUserPermissions(email);

  if (permissions.access === "all") {
    return true;
  }

  if (permissions.access === "specific" && permissions.domains) {
    return permissions.domains.includes(domainName);
  }

  return false;
}
