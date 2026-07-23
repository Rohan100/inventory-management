const { supabase } = require('../db');
const { generateOTP, verifyOTP } = require('../services/otpService');
const { enqueueReorderJob } = require('../services/queueService');
const { notifyReorderStatusUpdate } = require('../services/socketService');
const { logAudit } = require('../services/auditService');

exports.getAllReorders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reorder_requests')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve reorder requests' });
  }
};

exports.getReorderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: reorder, error } = await supabase
      .from('reorder_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !reorder) return res.status(404).json({ success: false, error: 'Reorder request not found' });

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', reorder.product_id)
      .maybeSingle();

    reorder.product = product || null;
    res.json({ success: true, data: reorder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.requestOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: reorder, error } = await supabase
      .from('reorder_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !reorder) return res.status(404).json({ success: false, error: 'Reorder request not found' });

    if (reorder.reorder_status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        error: `Reorder #${id} does not require OTP approval. Current status: ${reorder.reorder_status}`
      });
    }

    const otpData = generateOTP(id);

    const { error: updateErr } = await supabase
      .from('reorder_requests')
      .update({ otp_code: otpData.code, otp_expires_at: otpData.expiresAt })
      .eq('id', id);

    if (updateErr) throw updateErr;

    logAudit('OTP_REQUESTED', `OTP requested for High-Value Reorder #${id} (Product: "${reorder.product_name}")`, 'REORDER', id, req.ip);

    res.json({
      success: true,
      message: `OTP generated for Reorder #${id}. Verify to approve reorder.`,
      reorderId: id,
      expiresAt: otpData.expiresAt,
      testOTP: otpData.code
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.approveReorderWithOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp_code } = req.body;

    if (!otp_code) return res.status(400).json({ success: false, error: 'Please provide the 6-digit OTP code' });

    const { data: reorder, error } = await supabase
      .from('reorder_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !reorder) return res.status(404).json({ success: false, error: 'Reorder request not found' });

    if (reorder.reorder_status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        error: `Reorder #${id} is not pending approval (Current status: ${reorder.reorder_status})`
      });
    }

    const verification = verifyOTP(id, otp_code);
    if (!verification.valid) {
      logAudit('OTP_VERIFICATION_FAILED', `Invalid OTP attempt for Reorder #${id}: ${verification.reason}`, 'REORDER', id, req.ip);
      return res.status(400).json({ success: false, error: verification.reason });
    }

    const { data: updatedRows, error: updateErr } = await supabase
      .from('reorder_requests')
      .update({
        reorder_status: 'PENDING',
        otp_code: null,
        otp_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (updateErr) throw updateErr;
    const updatedReorder = updatedRows[0];

    notifyReorderStatusUpdate(updatedReorder);

    logAudit('OTP_APPROVED', `High-Value Reorder #${id} ($${reorder.total_cost}) approved via OTP`, 'REORDER', id, req.ip);

    await enqueueReorderJob(id);

    res.json({
      success: true,
      message: `Reorder #${id} successfully approved via OTP! Queued for supplier processing.`,
      data: updatedReorder
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
