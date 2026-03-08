import React, { useEffect, useState } from "react";
import { api } from "../api";
import MedicineModal from "../components/MedicineModal";
import { Search, Package, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";

export default function Inventory({ setActivePage }) {
  const [summary, setSummary] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMedicine, setEditMedicine] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory");

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
    if (editMedicine) await api.updateMedicine(editMedicine.id, form);
    else await api.addMedicine(form);
    setModalOpen(false);
    setEditMedicine(null);
    loadData();
  };

  const handleEdit = (med) => { setEditMedicine(med); setModalOpen(true); };

  if (loading) return <div className="loading">Loading inventory...</div>;

  return (
    <div className="page">
      {/* Header */}
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

      {/* Stat Cards - same on every page */}
      {summary && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon green"><DollarSign size={20} /></div>
              <span className="stat-badge green">↑ +12.5%</span>
            </div>
            <div className="stat-value">₹1,24,580</div>
            <div className="stat-label">Today's Sales</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon blue"><Package size={20} /></div>
              <span className="stat-badge blue">32 Orders</span>
            </div>
            <div className="stat-value">156</div>
            <div className="stat-label">Items Sold Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon orange"><AlertTriangle size={20} /></div>
              <span className="stat-badge orange">Action Needed</span>
            </div>
            <div className="stat-value">{summary.low_stock}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon purple"><CheckCircle size={20} /></div>
              <span className="stat-badge purple">5 Pending</span>
            </div>
            <div className="stat-value">₹96,250</div>
            <div className="stat-label">Purchase Orders</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-row">
        <div className="tabs">
          <button className="tab" onClick={() => setActivePage("dashboard")}>🛒 Sales</button>
          <button className="tab" onClick={() => setActivePage("dashboard")}>🛍 Purchase</button>
          <button className="tab active">📦 Inventory</button>
        </div>
        <div className="page-actions">
          <button className="btn-primary">+ New Sale</button>
          <button className="btn-secondary">+ New Purchase</button>
        </div>
      </div>

      {/* Inventory Overview */}
      {summary && (
        <div className="card inventory-summary">
          <h3 className="section-title">Inventory Overview</h3>
          <div className="inv-stat-grid">
            <div className="inv-stat">
              <div className="inv-stat-icon blue"><Package size={16} /></div>
              <div>
                <div className="inv-stat-label">Total Items</div>
                <div className="inv-stat-value">{summary.total_items}</div>
              </div>
            </div>
            <div className="inv-stat">
              <div className="inv-stat-icon green"><CheckCircle size={16} /></div>
              <div>
                <div className="inv-stat-label">Active Stock</div>
                <div className="inv-stat-value">{summary.active_stock}</div>
              </div>
            </div>
            <div className="inv-stat">
              <div className="inv-stat-icon orange"><AlertTriangle size={16} /></div>
              <div>
                <div className="inv-stat-label">Low Stock</div>
                <div className="inv-stat-value orange">{summary.low_stock}</div>
              </div>
            </div>
            <div className="inv-stat">
              <div className="inv-stat-icon green"><DollarSign size={16} /></div>
              <div>
                <div className="inv-stat-label">Total Value</div>
                <div className="inv-stat-value">₹{summary.total_value.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Inventory Table */}
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
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {["Active", "Low Stock", "Expired", "Out of Stock"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="btn-secondary">↑ Export</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                {["Medicine Name", "Generic Name", "Category", "Batch No",
                  "Expiry Date", "Quantity", "Cost Price", "MRP", "Supplier", "Status", "Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>No medicines found</td></tr>
              )}
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
                  <td><button className="btn-sm" onClick={() => handleEdit(med)}>Edit</button></td>
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
