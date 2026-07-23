import React, { useState } from 'react';
import { X, Layers, Plus, Minus, AlertTriangle, Loader2 } from 'lucide-react';

export default function StockUpdateModal({ isOpen, onClose, onUpdateStock, product }) {
  const [adjustMode, setAdjustMode] = useState('set'); // 'set' or 'delta'
  const [quantityValue, setQuantityValue] = useState(product ? product.available_quantity : 0);
  const [deltaValue, setDeltaValue] = useState(-5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const currentAvailable = product.available_quantity;
  const threshold = product.low_stock_threshold;

  const calculatedNewStock = adjustMode === 'set' 
    ? parseInt(quantityValue || 0, 10) 
    : currentAvailable + parseInt(deltaValue || 0, 10);

  const isWillBeLowStock = calculatedNewStock < threshold;

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (calculatedNewStock < 0) {
      return setError('Stock quantity cannot be negative.');
    }

    setLoading(true);
    setError('');

    try {
      if (adjustMode === 'set') {
        await onUpdateStock(product.id, { available_quantity: calculatedNewStock });
      } else {
        await onUpdateStock(product.id, { delta: parseInt(deltaValue, 10) });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-modal max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">Update Available Stock</h3>
              <p className="text-xs text-slate-400 font-mono">{product.name} ({product.sku})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleStockSubmit} className="space-y-4">
          
          {/* Toggle Mode */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAdjustMode('set')}
              className={`py-2 rounded-lg transition-all ${
                adjustMode === 'set' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Set Exact Quantity
            </button>
            <button
              type="button"
              onClick={() => setAdjustMode('delta')}
              className={`py-2 rounded-lg transition-all ${
                adjustMode === 'delta' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Adjust (+ / - Delta)
            </button>
          </div>

          {/* Current Info */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400">Current Stock:</span>
              <span className="font-bold font-mono text-slate-100 ml-2 text-sm">{currentAvailable}</span>
            </div>
            <div>
              <span className="text-slate-400">Low Stock Limit:</span>
              <span className="font-bold font-mono text-amber-400 ml-2 text-sm">{threshold}</span>
            </div>
          </div>

          {adjustMode === 'set' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Available Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input text-lg font-bold font-mono"
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adjustment Quantity (+ Add / - Reduce)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeltaValue(-5)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-rose-400 font-mono font-bold text-xs"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setDeltaValue(-1)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-rose-400 font-mono font-bold text-xs"
                >
                  -1
                </button>
                <input
                  type="number"
                  className="form-input font-mono font-bold text-center"
                  value={deltaValue}
                  onChange={(e) => setDeltaValue(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setDeltaValue(1)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 font-mono font-bold text-xs"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => setDeltaValue(10)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 font-mono font-bold text-xs"
                >
                  +10
                </button>
              </div>
            </div>
          )}

          {/* Forecasted Result Banner */}
          <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
            isWillBeLowStock 
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}>
            {isWillBeLowStock ? <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" /> : <Layers className="w-5 h-5 flex-shrink-0" />}
            <div>
              <p className="font-semibold">
                Forecasted Stock: <span className="font-mono text-sm font-bold">{calculatedNewStock} units</span>
              </p>
              <p className="text-[11px] opacity-90">
                {isWillBeLowStock
                  ? '⚠️ Will trigger automated low-stock detection & supplier reorder job.'
                  : 'Stock level is healthy above threshold.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-xs">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Stock Update'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
