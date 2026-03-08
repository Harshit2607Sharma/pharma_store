import { useState, useEffect } from "react";
import { X } from "lucide-react";

const empty = {
  medicine_name: "", generic_name: "", category: "",
  batch_no: "", expiry_date: "", quantity: 0,
  cost_price: 0, mrp: 0, supplier: "", status: "Active"
};

export default function MedicineModal({ medicine, onClose, onSave }) {
  const [form, setForm] = useState(medicine || empty);

  useEffect(() => {
    setForm(medicine || empty);
  }, [medicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{medicine ? "Edit Medicine" : "Add Medicine"}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {[
            ["medicine_name", "Medicine Name", "text", true],
            ["generic_name", "Generic Name", "text", false],
            ["category", "Category", "text", false],
            ["batch_no", "Batch No", "text", false],
            ["expiry_date", "Expiry Date", "date", false],
            ["quantity", "Quantity", "number", true],
            ["cost_price", "Cost Price (₹)", "number", true],
            ["mrp", "MRP (₹)", "number", true],
            ["supplier", "Supplier", "text", false],
          ].map(([name, label, type, required]) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input
                type={type}
                name={name}
                value={form[name] || ""}
                onChange={handleChange}
                required={required}
                step={type === "number" ? "0.01" : undefined}
              />
            </div>
          ))}
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              {["Active", "Low Stock", "Expired", "Out of Stock"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              {medicine ? "Update" : "Add Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
