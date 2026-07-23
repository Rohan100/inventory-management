import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, ShieldCheck, Search, Filter } from 'lucide-react';
import { getAuditLogs } from '../services/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs();
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = ['ALL', ...new Set(logs.map((l) => l.action))];

  const filteredLogs = logs.filter((l) => {
    const matchesSearch = l.details.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || l.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-heading">System Audit Trail Logs</h2>
            <p className="text-xs text-slate-400">Immutable recording of inventory edits, OTP verifications & stock triggers</p>
          </div>
        </div>

        <button onClick={fetchLogs} disabled={loading} className="btn-secondary text-xs">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Trail
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            className="form-input pl-10 text-xs"
            placeholder="Search audit details or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {actionTypes.map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterAction === act
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Action Event</th>
                <th>Details & Metadata</th>
                <th>Entity Target</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    No audit records matching search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span className="font-mono text-xs font-bold text-slate-400">#{l.id}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                        {l.action}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">{l.details}</p>
                    </td>
                    <td>
                      <span className="text-[11px] font-mono text-slate-400">
                        {l.entity_type ? `${l.entity_type} #${l.entity_id}` : 'SYSTEM'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-400">{l.ip_address}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-400">
                        {new Date(l.created_at).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
