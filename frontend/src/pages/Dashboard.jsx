import { useEffect, useState } from "react";
import { api } from "../api";
import StatCard from "../components/StatCard";
import { DollarSign, ShoppingCart, AlertTriangle, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getDashboardSummary(), api.getRecentSales()])
      .then(([s, r]) => { setSummary(s); setSales(r); })
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy CRM</h1>
          <p className="page-subtitle">Manage inventory, sales, and purchase orders</p>
        </div>
        <div className="page-actions">
          <button className="btn-secondary">↑ Export</button>
          <button className="btn-primary">+ Add Medicine</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<DollarSign size={20} />}
          color="green"
          badge={`↑ +${summary.sales_growth}%`}
          badgeColor="green"
          value={`₹${summary.today_sales.toLocaleString("en-IN")}`}
          label="Today's Sales"
        />
        <StatCard
          icon={<ShoppingCart size={20} />}
          color="blue"
          badge={`${summary.total_orders} Orders`}
          badgeColor="blue"
          value={summary.items_sold_today}
          label="Items Sold Today"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          color="orange"
          badge="Action Needed"
          badgeColor="orange"
          value={summary.low_stock_items}
          label="Low Stock Items"
        />
        <StatCard
          icon={<RefreshCw size={20} />}
          color="purple"
          badge={`${summary.pending_purchase_orders} Pending`}
          badgeColor="purple"
          value={`₹${summary.purchase_order_amount.toLocaleString("en-IN")}`}
          label="Purchase Orders"
        />
      </div>

      <div className="card">
        <h3 className="section-title">Recent Sales</h3>
        <div className="sales-list">
          {sales.map(sale => (
            <div key={sale.id} className="sale-row">
              <div className="sale-icon">🛒</div>
              <div className="sale-info">
                <span className="sale-invoice">{sale.invoice_no}</span>
                <span className="sale-meta">
                  {sale.customer_name} · {sale.items_count} items · {sale.payment_method}
                </span>
              </div>
              <div className="sale-right">
                <span className="sale-amount">₹{sale.total_amount}</span>
                <span className="sale-date">
                  {new Date(sale.sale_date).toLocaleDateString("en-IN")}
                </span>
                <span className={`status-badge ${sale.status.toLowerCase().replace(" ", "-")}`}>
                  {sale.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
