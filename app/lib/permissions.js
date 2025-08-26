// app/lib/permissions.js
export const userPermissions = {
  "sharanvkt@gmail.com": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "sharan@insanelabs.in": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "samuel@insanelabs.in": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "sharan@insanemarketers.com": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "samuel@insanemarketers.com": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "minal@insanelabs.in": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "sahil@insanelabs.in": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "saad@insanelabs.in": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "sharmin@insanelabs.in": {
    role: "admin",
    access: "all", // Full access to all domains
  },
  "divyanshu@astroarunpandit.org": {
    role: "editor",
    access: "specific",
    domains: ["Astro Arun Pandit"], // Access limited to specific domain(s)
  },
  "ankitbatra94@gmail.com": {
    role: "editor",
    access: "specific",
    domains: ["Ankit Batra"], // Access limited to specific domain(s)
  },
  "priyabatra1990@gmail.com": {
    role: "editor",
    access: "specific",
    domains: ["Ankit Batra"], // Access limited to specific domain(s)
  },
  "sonalmadaan2@gmail.com": {
    role: "editor",
    access: "specific",
    domains: ["Ankit Batra"], // Access limited to specific domain(s)
  },
  "ankit@insanelabs.in": {
    role: "editor",
    access: "specific",
    domains: ["Ankit Batra"], // Access limited to specific domain(s)
  },
  "sharanvkt.k@gmail.com": {
    role: "editor",
    access: "specific",
    domains: [
      "Chirag Jhumkhawala",
      "Siddharth Kapoor",
      "Aarzoo Shah",
      "Deepak Choudhary",
    ], // Access limited to specific domain(s)
  },
  "nikita@allianceoftitans.com": {
    role: "editor",
    access: "specific",
    domains: [
      "Chirag Jhumkhawala",
      "Siddharth Kapoor",
      "Aarzoo Shah",
      "Deepak Choudhary",
    ], // Access limited to specific domain(s)
  },
  "sudarshan@allianceoftitans.com": {
    role: "editor",
    access: "specific",
    domains: [
      "Chirag Jhumkhawala",
      "Siddharth Kapoor",
      "Aarzoo Shah",
      "Deepak Choudhary",
    ], // Access limited to specific domain(s)
  },
};

// Helper function to check user permissions
export function getUserPermissions(email) {
  // Check if user has explicit permissions defined
  if (userPermissions[email]) {
    return userPermissions[email];
  }

  // Check if user is from @insanelabs.in domain (but not already defined with specific access)
  if (email.endsWith("@insanelabs.in")) {
    return { role: "admin", access: "all" };
  }

  // Block all other users - no access
  return { role: "blocked", access: "none" };
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
