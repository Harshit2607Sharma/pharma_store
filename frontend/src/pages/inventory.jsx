import { useEffect, useState } from "react";
import { api } from "../api";
import MedicineModal from "../components/MedicineModal";
import { Search, Filter } from "lucide-react";

export default function Inventory() {
  const [summary, setSummary] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMedicine, setEditMedicine] = useState(null);

  const loadData = () => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    Promise.all([api.getInventorySummary(), api.getMedicines(params)])
      .then(([s, m]) => { setSummary(s); setMedicines(m); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [search, statusFilter]);

  const handleSave = async (form) => {
    if (editMedicine) {
      await api.updateMedicine(editMedicine.id, form);
    } else {
      await api.addMedicine(form);
    }
    setModalOpen(false);
    setEditMedicine(null);
    loadData();
  };

  const handleEdit = (med) => {
    setEditMedicine(med);
    setModalOpen(true);
  };

  if (loading) return <div className="loading">Loading inventory...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy CRM</h1>
          <p className="page-subtitle">Manage inventory, sales, and purchase orders</p>
        </div>
        <div className="page-actions">
          <button className="btn-secondary">↑ Export</button>
          <button className="btn-primary" onClick={() => { setEditMedicine(null); setModalOpen(true); }}>
            + Add Medicine
          </button>
        </div>
      </div>

      {summary && (
        <div className="card inventory-summary">
          <h3 className="section-title">Inventory Overview</h3>
          <div className="inv-stat-grid">
            <div className="inv-stat">
              <span className="inv-stat-label">Total Items</span>
              <span className="inv-stat-value">{summary.total_items}</span>
            </div>
            <div className="inv-stat">
              <span className="inv-stat-label">Active Stock</span>
              <span className="inv-stat-value">{summary.active_stock}</span>
            </div>
            <div className="inv-stat">
              <span className="inv-stat-label">Low Stock</span>
              <span className="inv-stat-value orange">{summary.low_stock}</span>
            </div>
            <div className="inv-stat">
              <span className="inv-stat-label">Total Value</span>
              <span className="inv-stat-value">₹{summary.total_value.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-header">
          <h3 className="section-title">Complete Inventory</h3>
          <div className="table-controls">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search medicines..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              {["Active", "Low Stock", "Expired", "Out of Stock"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                {["Medicine Name", "Generic Name", "Category", "Batch No",
                  "Expiry Date", "Qty", "Cost Price", "MRP", "Supplier", "Status", "Actions"]
                  .map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {medicines.map(med => (
                <tr key={med.id}>
                  <td className="med-name">{med.medicine_name}</td>
                  <td>{med.generic_name}</td>
                  <td>{med.category}</td>
                  <td>{med.batch_no}</td>
                  <td>{med.expiry_date}</td>
                  <td>{med.quantity}</td>
                  <td>₹{med.cost_price}</td>
                  <td>₹{med.mrp}</td>
                  <td>{med.supplier}</td>
                  <td>
                    <span className={`status-badge ${med.status.toLowerCase().replace(" ", "-")}`}>
                      {med.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(med)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <MedicineModal
          medicine={editMedicine}
          onClose={() => { setModalOpen(false); setEditMedicine(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
