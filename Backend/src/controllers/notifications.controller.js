import Notification from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({
    createdAt: -1,
  })

  return sendSuccess(res, {
    data: notifications,
  })
})

export const markAsRead = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'notification id')
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  )

  if (!notification) {
    throw new ApiError(404, 'Notification not found')
  }

  return sendSuccess(res, {
    message: 'Notification marked as read',
    data: notification,
  })
})
