export const CATEGORIES = [
  { value: 'tiles', label: 'Tiles' },
  { value: 'laminates', label: 'Laminates' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'other', label: 'Other' },
];

export const UNITS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'box', label: 'Box' },
  { value: 'sqft', label: 'Square Feet' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'meter', label: 'Meters' },
];

export const ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
];

export const TRANSACTION_TYPES = [
  { value: 'IN', label: 'Stock In' },
  { value: 'OUT', label: 'Stock Out' },
];

export const ROLE_PERMISSIONS = {
  owner: {
    canManageUsers: true,
    canManageWarehouses: true,
    canManageSKUs: true,
    canDeleteSKUs: true,
    canSetInventory: true,
    canViewAnalytics: true,
    canViewAllPages: true,
  },
  manager: {
    canManageUsers: false,
    canManageWarehouses: false,
    canManageSKUs: true,
    canDeleteSKUs: false,
    canSetInventory: true,
    canViewAnalytics: true,
    canViewAllPages: true,
  },
  staff: {
    canManageUsers: false,
    canManageWarehouses: false,
    canManageSKUs: false,
    canDeleteSKUs: false,
    canSetInventory: false,
    canViewAnalytics: false,
    canViewAllPages: false,
  },
};

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['owner', 'manager', 'staff'] },
  { href: '/inventory', label: 'Inventory', icon: 'Package', roles: ['owner', 'manager', 'staff'] },
  { href: '/sku', label: 'SKU Management', icon: 'Boxes', roles: ['owner', 'manager'] },
  { href: '/warehouses', label: 'Warehouses', icon: 'Warehouse', roles: ['owner'] },
  { href: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight', roles: ['owner', 'manager', 'staff'] },
  { href: '/alerts', label: 'Alerts', icon: 'AlertTriangle', roles: ['owner', 'manager', 'staff'] },
  { href: '/analytics', label: 'Analytics', icon: 'BarChart3', roles: ['owner', 'manager'] },
  { href: '/users', label: 'Users', icon: 'Users', roles: ['owner'] },
];

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getCategoryLabel = (value) => {
  const category = CATEGORIES.find(c => c.value === value);
  return category ? category.label : value;
};

export const getUnitLabel = (value) => {
  const unit = UNITS.find(u => u.value === value);
  return unit ? unit.label : value;
};

export const getRoleLabel = (value) => {
  const role = ROLES.find(r => r.value === value);
  return role ? role.label : value;
};
