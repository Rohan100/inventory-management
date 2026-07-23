import React from 'react';

export default function MetricCards({ products = [], reorders = [] }) {
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.available_quantity < p.low_stock_threshold).length;
  const pendingApprovals = reorders.filter(r => r.reorder_status === 'PENDING_APPROVAL').length;
  const totalReorderValue = reorders.reduce((sum, r) => sum + parseFloat(r.total_cost || 0), 0);

  const metrics = [
    { label: 'Total Products', value: totalProducts, sub: `${totalProducts - lowStockProducts} healthy` },
    { label: 'Low Stock Alerts', value: lowStockProducts, sub: lowStockProducts > 0 ? 'Action needed' : 'All good' },
    { label: 'Pending Approvals', value: pendingApprovals, sub: 'OTP required' },
    { label: 'Reorder Value', value: `₹${totalReorderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sub: `${reorders.length} orders` }
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((m, i) => (
        <div key={i} className="metric-card">
          <span className="metric-label">{m.label}</span>
          <span className="metric-value">{m.value}</span>
          <span className="metric-sub">{m.sub}</span>
        </div>
      ))}
    </div>
  );
}
