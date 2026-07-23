import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, product = null }) {
  const [formData, setFormData] = useState({
    name: '', sku: '', available_quantity: 10, low_stock_threshold: 5,
    cost_price: 49.99, supplier_name: 'Global Supplies Co.', category: 'General'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '', sku: product.sku || '',
        available_quantity: product.available_quantity ?? 0,
        low_stock_threshold: product.low_stock_threshold ?? 5,
        cost_price: product.cost_price ?? 0,
        supplier_name: product.supplier_name || 'Global Supplies Co.',
        category: product.category || 'General'
      });
    } else {
      setFormData({ name: '', sku: '', available_quantity: 10, low_stock_threshold: 5, cost_price: 49.99, supplier_name: 'Global Supplies Co.', category: 'General' });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError('Product name is required');
    if (!formData.sku.trim()) return setError('SKU is required');

    setLoading(true);
    setError('');
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 4 };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="btn btn-ghost"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 12 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={fieldStyle}>
                <label className="form-label">Product Name *</label>
                <input className="form-input" placeholder="e.g. Keyboard" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div style={fieldStyle}>
                <label className="form-label">SKU Code *</label>
                <input className="form-input" placeholder="KB-001" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required style={{ textTransform: 'uppercase', fontFamily: 'monospace' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div style={fieldStyle}>
                <label className="form-label">Quantity *</label>
                <input type="number" min="0" className="form-input" value={formData.available_quantity} onChange={e => setFormData({ ...formData, available_quantity: e.target.value })} required />
              </div>
              <div style={fieldStyle}>
                <label className="form-label">Low Stock Limit *</label>
                <input type="number" min="0" className="form-input" value={formData.low_stock_threshold} onChange={e => setFormData({ ...formData, low_stock_threshold: e.target.value })} required />
              </div>
              <div style={fieldStyle}>
                <label className="form-label">Cost Price (₹) *</label>
                <input type="number" step="0.01" min="0.01" className="form-input" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: e.target.value })} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={fieldStyle}>
                <label className="form-label">Supplier</label>
                <input className="form-input" placeholder="Supplier name" value={formData.supplier_name} onChange={e => setFormData({ ...formData, supplier_name: e.target.value })} />
              </div>
              <div style={fieldStyle}>
                <label className="form-label">Category</label>
                <input className="form-input" placeholder="Electronics" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
              {loading ? <Loader2 size={14} className="animate-spin" /> : product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
