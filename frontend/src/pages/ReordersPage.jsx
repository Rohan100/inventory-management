import React, { useState } from 'react';
import { RefreshCw, Eye, KeyRound, Loader2 } from 'lucide-react';
import OtpModal from '../components/OtpModal';
import ReorderDetailModal from '../components/ReorderDetailModal';

export default function ReordersPage({ reorders = [], fetchReorders }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReorderForOtp, setSelectedReorderForOtp] = useState(null);
  const [selectedReorderDetail, setSelectedReorderDetail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReorders();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredReorders = reorders.filter(r => statusFilter === 'ALL' || r.reorder_status === statusFilter);

  const getStatusClass = (s) => {
    switch (s) {
      case 'COMPLETED': return 'status-completed';
      case 'PROCESSING': return 'status-processing';
      case 'PENDING_APPROVAL': return 'status-pending-approval';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      default: return 'status-pending';
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <h2 className="page-title">Supplier Reorders</h2>
        <button onClick={handleRefresh} disabled={refreshing} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filter pills */}
      <div className="filter-pills">
        {['ALL', 'PENDING_APPROVAL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
          >
            {st === 'PENDING_APPROVAL' ? 'Pending Approval' : st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Reorders Table */}
      <div className="card">
        <div className="card-header">Reorder Requests</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Supplier</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReorders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    No reorders found.
                  </td>
                </tr>
              ) : (
                filteredReorders.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.product_name}</td>
                    <td>{r.quantity_ordered}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.supplier_name}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4ade80' }}>
                      ₹{parseFloat(r.total_cost).toFixed(2)}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(r.reorder_status)}`}>
                        {r.reorder_status === 'PROCESSING' && <Loader2 size={12} className="animate-spin" />}
                        {r.reorder_status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="actions-cell">
                      {r.reorder_status === 'PENDING_APPROVAL' && (
                        <button onClick={() => setSelectedReorderForOtp(r)} className="btn btn-warning btn-sm">
                          <KeyRound size={13} /> Approve
                        </button>
                      )}
                      <button onClick={() => setSelectedReorderDetail(r)} className="btn btn-outline btn-sm">
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OtpModal
        isOpen={!!selectedReorderForOtp}
        onClose={() => setSelectedReorderForOtp(null)}
        reorder={selectedReorderForOtp}
        onSuccess={handleRefresh}
      />
      <ReorderDetailModal
        isOpen={!!selectedReorderDetail}
        onClose={() => setSelectedReorderDetail(null)}
        reorder={selectedReorderDetail}
      />
    </div>
  );
}
