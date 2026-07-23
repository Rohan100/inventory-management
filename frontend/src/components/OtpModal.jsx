import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { requestReorderOTP, approveReorderOTP } from '../services/api';

export default function OtpModal({ isOpen, onClose, reorder, onSuccess }) {
  const [otpInput, setOtpInput] = useState('');
  const [requestedOtp, setRequestedOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !reorder) return null;

  const handleRequestOtp = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await requestReorderOTP(reorder.id);
      if (res.data.success) {
        setRequestedOtp(res.data.testOTP);
        setSuccessMsg(`OTP Code generated! (Test Code: ${res.data.testOTP})`);
        setOtpInput(res.data.testOTP || '');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      return setError('Please enter the 6-digit OTP verification code.');
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await approveReorderOTP(reorder.id, otpInput.trim());
      if (res.data.success) {
        setSuccessMsg('Reorder approved successfully via OTP verification!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal max-w-md w-full p-6 shadow-2xl relative border-orange-500/30">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">High-Value Reorder Approval</h3>
              <p className="text-xs text-slate-400">Requires 6-Digit Admin OTP Authorization</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Reorder Request ID:</span>
            <span className="font-mono font-bold text-slate-100">#{reorder.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Product Name:</span>
            <span className="font-semibold text-slate-200">{reorder.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Quantity Ordered:</span>
            <span className="font-mono font-semibold text-slate-200">{reorder.quantity_ordered} units</span>
          </div>
          <div className="flex justify-between border-t border-slate-800/80 pt-2 font-bold text-sm">
            <span className="text-slate-300">Total Reorder Cost:</span>
            <span className="text-emerald-400 font-mono">${parseFloat(reorder.total_cost).toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleApproveWithOtp} className="space-y-4">
          
          {/* OTP Code Generation Box */}
          {!requestedOtp ? (
            <div className="text-center p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-700">
              <KeyRound className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium mb-3">
                Click below to request an authorization OTP code.
              </p>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={loading}
                className="btn-warning text-xs w-full justify-center"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔑 Generate OTP Authorization Code'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Enter 6-Digit OTP Code *</label>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Resend OTP
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                className="form-input text-center text-2xl font-bold font-mono tracking-widest text-orange-400 py-3"
                placeholder="123456"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                required
              />

              {requestedOtp && (
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Development Mode: Active OTP is <span className="font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{requestedOtp}</span>
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            {requestedOtp && (
              <button type="submit" disabled={loading} className="btn-primary text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve & Trigger Reorder'}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
