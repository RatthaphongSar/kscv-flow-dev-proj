import { prisma } from '../db.js'

/**
 * Update user preferences
 * PATCH /api/settings/preferences
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const {
      theme,
      notifications,
      language,
      timezone,
      emailNotifications,
      pushNotifications
    } = req.body

    // Build update object with only provided fields
    const updateData = {}
    if (theme !== undefined) updateData.theme = theme
    if (notifications !== undefined) updateData.notifications = notifications
    if (language !== undefined) updateData.language = language
    if (timezone !== undefined) updateData.timezone = timezone
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        theme: true,
        notifications: true,
        language: true,
        timezone: true,
        emailNotifications: true,
        pushNotifications: true
      }
    })

    res.status(200).json({
      message: 'Preferences updated successfully',
      user
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Get user preferences
 * GET /api/settings/preferences
 */
export const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        theme: true,
        notifications: true,
        language: true,
        timezone: true,
        emailNotifications: true,
        pushNotifications: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({ preferences: user })
  } catch (err) {
    next(err)
  }
}
