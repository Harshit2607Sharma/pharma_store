export default function StatCard({ icon, color, badge, badgeColor, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon ${color}`}>{icon}</div>
        {badge && (
          <span className={`stat-badge ${badgeColor}`}>{badge}</span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
