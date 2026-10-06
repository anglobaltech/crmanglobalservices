
export const ROLES_CONFIG = [
  { department: "management", name: "Super Admin" },
  { department: "management", name: "Director" },
  { department: "management", name: "Founder & CEO" },
  { department: "sales", name: "Branch Manager" },
  { department: "sales", name: "Manager" },
  { department: "sales", name: "Team Manager" },
  { department: "sales", name: "Assistant Manager" },
  { department: "sales", name: "Executive" },
  { department: "sales", name: "Intern" },
  { department: "services", name: "Service Manager" },
  { department: "services", name: "Senior Executive" },
  { department: "services", name: "Executive" },
  { department: "services", name: "Support Staff" },
  { department: "services", name: "Intern" },
  { department: "accounts", name: "Account Manager" },
  { department: "accounts", name: "Accountant" },
  { department: "accounts", name: "Intern" },
  { department: "software", name: "Senior Software Engineer" },
  { department: "software", name: "Software Engineer" },
  { department: "software", name: "Web Developer" },
  { department: "software", name: "Web Developer Intern" },
  { department: "software", name: "Data Analyst" },
  { department: "software", name: "Data Analyst Intern" },
  { department: "software", name: "Intern" },
];

export const DEPT_COLORS = {
  management: "bg-purple-100 text-purple-700",
  sales: "bg-blue-100 text-blue-700",
  services: "bg-emerald-100 text-emerald-700",
  accounts: "bg-orange-100 text-orange-700",
  software: "bg-cyan-100 text-cyan-700",
};

export const DEPARTMENTS = ["management", "sales", "services", "accounts", "software"];

export const MODULE_LABELS = {
  dashboard: "Dashboard",
  users: "Users",
  sales: "Sales",
  allocate: "Allocate",
  settings: "Settings",
  services: "Services",
  projects: "Projects",
  stock: "Stock",
  employees: "Employees",
  documents: "Documents",
};

export const MODULES = [
  "dashboard",
  "users",
  "sales",
  "allocate",
  "settings",
  "services",
  "projects",
  "stock",
  "employees",
  "documents",
];


export const DEFAULT_PERMISSIONS = {
  "Super Admin":       { dashboard: true,  users: true,  sales: true,  allocate: true,  settings: true,  services: true,  projects: true,  stock: true,  employees: true,  documents: true  },
  "Founder & CEO":     { dashboard: true,  users: true,  sales: true,  allocate: true,  settings: true,  services: true,  projects: true,  stock: true,  employees: true,  documents: true  },
  "Director":          { dashboard: true,  users: true,  sales: true,  allocate: true,  settings: false, services: true,  projects: true,  stock: true,  employees: true,  documents: true  },
  "Branch Manager":    { dashboard: true,  users: false, sales: true,  allocate: true,  settings: false, services: false, projects: false, stock: false, employees: true,  documents: true  },
  "Manager":           { dashboard: true,  users: false, sales: true,  allocate: false, settings: false, services: false, projects: false, stock: false, employees: false, documents: false },
  "Team Manager":      { dashboard: true,  users: false, sales: true,  allocate: false, settings: false, services: false, projects: false, stock: false, employees: false, documents: false },
  "Assistant Manager": { dashboard: true,  users: false, sales: true,  allocate: false, settings: false, services: false, projects: false, stock: false, employees: false, documents: false },
  "Executive":         { dashboard: true,  users: false, sales: true,  allocate: false, settings: false, services: false, projects: false, stock: false, employees: false, documents: false },
  "Intern":            { dashboard: true,  users: false, sales: false, allocate: false, settings: false, services: false, projects: false, stock: false, employees: false, documents: false },
  "Service Manager":   { dashboard: true,  users: false, sales: false, allocate: true,  settings: false, services: true,  projects: true,  stock: true,  employees: true,  documents: true  },
  "Senior Executive":  { dashboard: true,  users: false, sales: false, allocate: false, settings: false, services: true,  projects: true,  stock: true,  employees: false, documents: true  },
  "Support Staff":     { dashboard: true,  users: false, sales: false, allocate: false, settings: false, services: true,  projects: true,  stock: true,  employees: false, documents: false },
};