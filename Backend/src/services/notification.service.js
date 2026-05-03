export const buildNotification = ({ type, title, message, userId, companyId = null }) => ({
  type,
  title,
  message,
  userId,
  companyId,
})
