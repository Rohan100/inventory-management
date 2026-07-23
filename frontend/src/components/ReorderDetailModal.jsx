import React from 'react';
import { X, Truck, Calendar, DollarSign, Building, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ReorderDetailModal({ isOpen, onClose, reorder }) {
  if (!isOpen || !reorder) return null;

  const status = reorder.reorder_status;
  
  const getBadgeClass = (s) => {
    switch (s) {
      case 'COMPLETED': return 'badge-completed';
      case 'PROCESSING': return 'badge-processing';
      case 'PENDING_APPROVAL': return 'badge-pending-approval';
      case 'PENDING': return 'badge-pending';
      case 'FAILED': return 'badge-failed';
      default: return 'badge-pending';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">Supplier Reorder Request #{reorder.id}</h3>
              <p className="text-xs text-slate-400">Detailed overview of automated reorder process</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-medium">Reorder Status:</span>
            <span className={`badge ${getBadgeClass(status)}`}>
              {status === 'PENDING_APPROVAL' ? '⚠️ Pending Approval (OTP Required)' : status}
            </span>
          </div>

          {/* Product & Cost Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <p className="text-slate-400 text-[11px]">Product Name</p>
              <p className="font-bold text-slate-100 text-sm">{reorder.product_name}</p>
              {reorder.product?.sku && (
                <p className="font-mono text-[11px] text-indigo-400">SKU: {reorder.product.sku}</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <p className="text-slate-400 text-[11px]">Quantity Ordered</p>
              <p className="font-bold text-slate-100 text-sm font-mono">{reorder.quantity_ordered} units</p>
              <p className="text-[11px] text-slate-400">@ ${parseFloat(reorder.unit_cost).toFixed(2)} / unit</p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-400" /> Supplier:
              </span>
              <span className="font-semibold text-slate-100">{reorder.supplier_name}</span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 font-bold text-sm">
              <span className="text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Total Reorder Value:
              </span>
              <span className="text-emerald-400 font-mono text-base">${parseFloat(reorder.total_cost).toFixed(2)}</span>
            </div>

            {reorder.is_high_value && (
              <p className="text-[11px] text-orange-300 pt-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-400" /> High-Value Order (&gt;$500.00 Limit)
              </p>
            )}
          </div>

          {/* Timestamps */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Created At:</span>
              <span className="font-mono text-slate-200">{new Date(reorder.created_at).toLocaleString()}</span>
            </div>
            {reorder.updated_at && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Last Updated:</span>
                <span className="font-mono text-slate-200">{new Date(reorder.updated_at).toLocaleString()}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
          <button onClick={onClose} className="btn-secondary text-xs">
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
