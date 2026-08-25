
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

];

export const DEPT_COLORS = {
  management: "bg-purple-100 text-purple-700",
  sales: "bg-blue-100 text-blue-700",
  services: "bg-emerald-100 text-emerald-700",
};

export const DEPARTMENTS = ["management", "sales", "services"];

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
];


export const DEFAULT_PERMISSIONS = {
  "Super Admin":       { dashboard: true,  users: true,  sales: true,  allocate: true,  settings: true,  services: true,  projects: true,  stock: true,  employees: true  },
  "Founder & CEO":     { dashboard: true,  users: true,  sales: true,  allocate: true,  settings: true,  services: true,  projects: true,  stock: true,  employees: true  },
  "Director":          { dashboard: true,  users: true,  sales: true,  allocate: true,  settings: false, services: true,  projects: true,  stock: true,  employees: true  },
  "Branch Manager":    { dashboard: true,  users: false, sales: true,  allocate: true,  settings: false, services: false, projects: false, stock: false, employees: true  },
  "Manager":           { dashboard: true,  users: false, sales: true,  allocate: false, settings: false, services: false, projects: false, stock: false, employees: false },
  "Team Manager":      { dashboard: true,  users: false, sales: true,  allocate: false, settings: false, services: false, projects: false, stock: false, employees: false },
  "Assistant Manager": { dashboard: true,  users: false, sales: true,  allocate: false, settings: false, services: false, projects: false, stock: false, employees: false },
  "Executive":         { dashboard: true,  users: false, sales: true,  allocate: false, settings: false, services: false, projects: false, stock: false, employees: false },
  "Intern":            { dashboard: true,  users: false, sales: false, allocate: false, settings: false, services: false, projects: false, stock: false, employees: false },
  "Service Manager":   { dashboard: true,  users: false, sales: false, allocate: true,  settings: false, services: true,  projects: true,  stock: true,  employees: true  },
  "Senior Executive":  { dashboard: true,  users: false, sales: false, allocate: false, settings: false, services: true,  projects: true,  stock: true,  employees: false },
  "Support Staff":     { dashboard: true,  users: false, sales: false, allocate: false, settings: false, services: true,  projects: true,  stock: true,  employees: false },
};