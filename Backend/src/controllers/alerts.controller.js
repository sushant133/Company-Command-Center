import SmartAlert from '../models/SmartAlert.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'

export const getSmartAlerts = asyncHandler(async (req, res) => {
  const query = {}

  if (req.user.role !== 'superadmin') {
    query.companyId = req.user.companyId
  }

  if (req.query.status) {
    query.status = req.query.status
  }

  if (req.query.severity) {
    query.severity = req.query.severity
  }

  const alerts = await SmartAlert.find(query).sort({ severity: -1, createdAt: -1 })

  return sendSuccess(res, {
    data: alerts,
  })
})
