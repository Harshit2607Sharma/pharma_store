import { LayoutDashboard, Package, ShoppingCart, Settings } from "lucide-react";

export default function Sidebar({ activePage, setActivePage }) {
  const links = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "inventory", icon: Package, label: "Inventory" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">💊</div>
      <nav className="sidebar-nav">
        {links.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`sidebar-btn ${activePage === id ? "active" : ""}`}
            onClick={() => setActivePage(id)}
            title={label}
          >
            <Icon size={20} />
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="sidebar-btn" title="Settings">
          <Settings size={20} />
        </button>
      </div>
    </aside>
  );
}
