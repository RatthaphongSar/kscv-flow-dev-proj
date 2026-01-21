// backend/src/services/videoConferencing.js
import { prisma } from '../db.js'

/**
 * Video Conferencing Service
 * Handles WebRTC signaling, screen sharing, and video call state management
 */

// Track active video sessions and peer connections
const activeSessions = new Map()
const userConnections = new Map()

/**
 * Start a video session for a meeting
 * @param {string} meetingId - Meeting ID
 * @returns {Promise<VideoSession>}
 */
export async function startVideoSession(meetingId) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    })

    if (!meeting) {
      throw new Error('Meeting not found')
    }

    const videoSession = await prisma.videoSession.create({
      data: {
        status: 'active',
        meeting: { connect: { id: meetingId } },
      },
    })

    activeSessions.set(meetingId, {
      sessionId: videoSession.id,
      startedAt: videoSession.startedAt,
      participants: [],
    })

    return videoSession
  } catch (error) {
    console.error('[VideoConferencing] Error starting video session:', error)
    throw error
  }
}

/**
 * Get active session ID for a meeting
 * @param {string} meetingId
 * @returns {string|null}
 */
export function getActiveSessionId(meetingId) {
    const session = activeSessions.get(meetingId);
    if (session) return session.sessionId;
    
    // If not in memory, maybe we should check DB? 
    // But for now, let's rely on memory or return null (which will cause join to fail if not handled)
    return null; 
}

export async function endVideoSession(meetingId, sessionId) {
  try {
    const duration = Math.floor(
      (new Date() - new Date(await prisma.videoSession.findUnique({
        where: { id: sessionId },
      }))?.startedAt) / 1000
    )

    const videoSession = await prisma.videoSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endedAt: new Date(),
        duration,
      },
    })

    activeSessions.delete(meetingId)

    return videoSession
  } catch (error) {
    console.error('[VideoConferencing] Error ending video session:', error)
    throw error
  }
}

/**
 * Join a video call
 * @param {string} meetingId - Meeting ID
 * @param {string} userId - User ID
 * @param {string} sessionId - Video session ID
 * @returns {Promise<VideoParticipant>}
 */
export async function joinVideoCall(meetingId, userId, sessionId) {
  try {
    // Check if already in session
    const existing = await prisma.videoParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    })

    if (existing) {
      return existing
    }

    // Create new participant record
    const participant = await prisma.videoParticipant.create({
      data: {
        user: { connect: { id: userId } },
        session: { connect: { id: sessionId } },
        videoEnabled: true,
        audioEnabled: true,
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    })

    // Track in memory
    if (!userConnections.has(meetingId)) {
      userConnections.set(meetingId, new Set())
    }
    userConnections.get(meetingId).add(userId)

    return participant
  } catch (error) {
    console.error('[VideoConferencing] Error joining video call:', error)
    throw error
  }
}

/**
 * Leave a video call
 * @param {string} meetingId - Meeting ID
 * @param {string} userId - User ID
 * @param {string} sessionId - Video session ID
 * @returns {Promise<VideoParticipant>}
 */
export async function leaveVideoCall(meetingId, userId, sessionId) {
  try {
    const participant = await prisma.videoParticipant.update({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      data: {
        leftAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    })

    // Remove from tracking
    if (userConnections.has(meetingId)) {
      userConnections.get(meetingId).delete(userId)
    }

    return participant
  } catch (error) {
    console.error('[VideoConferencing] Error leaving video call:', error)
    throw error
  }
}

/**
 * Get active participants in a video session
 * @param {string} sessionId - Video session ID
 * @returns {Promise<VideoParticipant[]>}
 */
export async function getActiveParticipants(sessionId) {
  try {
    const participants = await prisma.videoParticipant.findMany({
      where: {
        sessionId,
        leftAt: null,
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    })

    return participants
  } catch (error) {
    console.error('[VideoConferencing] Error getting participants:', error)
    throw error
  }
}

/**
 * Toggle camera for participant
 * @param {string} sessionId - Video session ID
 * @param {string} userId - User ID
 * @param {boolean} enabled - Camera enabled state
 * @returns {Promise<VideoParticipant>}
 */
export async function toggleCamera(sessionId, userId, enabled) {
  try {
    const participant = await prisma.videoParticipant.update({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      data: {
        videoEnabled: enabled,
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    })

    return participant
  } catch (error) {
    console.error('[VideoConferencing] Error toggling camera:', error)
    throw error
  }
}

/**
 * Toggle microphone for participant
 * @param {string} sessionId - Video session ID
 * @param {string} userId - User ID
 * @param {boolean} enabled - Microphone enabled state
 * @returns {Promise<VideoParticipant>}
 */
export async function toggleMicrophone(sessionId, userId, enabled) {
  try {
    const participant = await prisma.videoParticipant.update({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      data: {
        audioEnabled: enabled,
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    })

    return participant
  } catch (error) {
    console.error('[VideoConferencing] Error toggling microphone:', error)
    throw error
  }
}

/**
 * Start screen sharing
 * @param {string} meetingId - Meeting ID
 * @param {string} userId - User ID (presenter)
 * @returns {Promise<ScreenShareSession>}
 */
export async function startScreenShare(meetingId, userId) {
  try {
    const screenSession = await prisma.screenShareSession.create({
      data: {
        presenter: { connect: { id: userId } },
        meeting: { connect: { id: meetingId } },
      },
      include: {
        presenter: {
          select: { id: true, username: true },
        },
      },
    })

    return screenSession
  } catch (error) {
    console.error('[VideoConferencing] Error starting screen share:', error)
    throw error
  }
}

/**
 * Stop screen sharing
 * @param {string} screenSessionId - Screen share session ID
 * @returns {Promise<ScreenShareSession>}
 */
export async function stopScreenShare(screenSessionId) {
  try {
    const screenSession = await prisma.screenShareSession.update({
      where: { id: screenSessionId },
      data: {
        stoppedAt: new Date(),
        duration: Math.floor(
          (new Date() - new Date(await prisma.screenShareSession.findUnique({
            where: { id: screenSessionId },
          }))?.startedAt) / 1000
        ),
      },
      include: {
        presenter: {
          select: { id: true, username: true },
        },
      },
    })

    return screenSession
  } catch (error) {
    console.error('[VideoConferencing] Error stopping screen share:', error)
    throw error
  }
}

/**
 * Log call statistics
 * @param {string} sessionId - Video session ID
 * @param {object} stats - Call statistics
 * @returns {Promise<CallStats>}
 */
export async function logCallStats(sessionId, meetingId, stats) {
  try {
    const callStats = await prisma.callStats.create({
      data: {
        session: { connect: { id: sessionId } },
        meeting: { connect: { id: meetingId } },
        videoBitrate: stats.videoBitrate,
        videoFramerate: stats.videoFramerate,
        videoResolution: stats.videoResolution,
        audioBitrate: stats.audioBitrate,
        audioLevel: stats.audioLevel,
        latencyMs: stats.latencyMs,
        jitterMs: stats.jitterMs,
        packetLossPercent: stats.packetLossPercent,
        bandwidth: stats.bandwidth,
      },
    })

    return callStats
  } catch (error) {
    console.error('[VideoConferencing] Error logging call stats:', error)
    throw error
  }
}

/**
 * Get call statistics for a session
 * @param {string} sessionId - Video session ID
 * @returns {Promise<CallStats[]>}
 */
export async function getCallStats(sessionId) {
  try {
    const stats = await prisma.callStats.findMany({
      where: { sessionId },
      orderBy: { recordedAt: 'desc' },
      take: 100, // Last 100 records
    })

    return stats
  } catch (error) {
    console.error('[VideoConferencing] Error getting call stats:', error)
    throw error
  }
}

/**
 * Save a chat message in a meeting
 * @param {string} meetingId - Meeting ID
 * @param {string} userId - User ID
 * @param {string} content - Message content
 * @param {string} senderName - Sender name
 * @returns {Promise<ChatMessage>}
 */
export async function saveChatMessage(meetingId, userId, content, senderName) {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        content,
        senderName,
        sender: { connect: { id: userId } },
        meeting: { connect: { id: meetingId } },
      },
      include: {
        sender: {
          select: { id: true, username: true },
        },
      },
    })

    return message
  } catch (error) {
    console.error('[VideoConferencing] Error saving chat message:', error)
    throw error
  }
}

/**
 * Get chat history for a meeting
 * @param {string} meetingId - Meeting ID
 * @param {number} limit - Number of messages to retrieve
 * @returns {Promise<ChatMessage[]>}
 */
export async function getChatHistory(meetingId, limit = 50) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { meetingId },
      include: {
        sender: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })

    return messages
  } catch (error) {
    console.error('[VideoConferencing] Error getting chat history:', error)
    throw error
  }
}

/**
 * Get active session info
 * @param {string} meetingId - Meeting ID
 * @returns {object} Active session info
 */
export function getActiveSessionInfo(meetingId) {
  return activeSessions.get(meetingId) || null
}

/**
 * Get user connections for a meeting
 * @param {string} meetingId - Meeting ID
 * @returns {Set} Set of user IDs
 */
export function getConnectedUsers(meetingId) {
  return userConnections.get(meetingId) || new Set()
}
