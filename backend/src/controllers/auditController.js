const { getAuditLogs } = require('../services/auditService');

exports.getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const logs = await getAuditLogs(limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
