const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  // Dashboard
  getDashboardSummary: () =>
    fetch(`${BASE_URL}/api/dashboard/summary`).then(r => r.json()),
  getRecentSales: () =>
    fetch(`${BASE_URL}/api/dashboard/recent-sales`).then(r => r.json()),

  // Inventory
  getInventorySummary: () =>
    fetch(`${BASE_URL}/api/inventory/summary`).then(r => r.json()),
  getMedicines: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/api/inventory/medicines?${q}`).then(r => r.json());
  },
  addMedicine: (data) =>
    fetch(`${BASE_URL}/api/inventory/medicines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  updateMedicine: (id, data) =>
    fetch(`${BASE_URL}/api/inventory/medicines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  deleteMedicine: (id) =>
    fetch(`${BASE_URL}/api/inventory/medicines/${id}`, { method: "DELETE" }).then(r => r.json()),
};
