const { supabase } = require('../db');

/**
 * Record an audit log entry
 */
async function logAudit(action, details, entityType = null, entityId = null, ipAddress = '127.0.0.1') {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{ action, details, entity_type: entityType, entity_id: entityId, ip_address: ipAddress }]);

    if (error) throw error;
    console.log(`📝 [Audit Log] ${action}: ${details}`);
  } catch (err) {
    console.error('Failed to record audit log:', err.message);
  }
}

/**
 * Fetch recent audit logs
 */
async function getAuditLogs(limit = 50) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('id', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

module.exports = { logAudit, getAuditLogs };
