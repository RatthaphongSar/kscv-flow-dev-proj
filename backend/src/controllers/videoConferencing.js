// backend/src/controllers/videoConferencing.js
import * as videoService from '../services/videoConferencing.js'
import { prisma } from '../db.js'

/**
 * Start recording a video call
 * POST /api/meetings/:id/recording/start
 */
export async function startRecording(req, res) {
  try {
    const { id: meetingId } = req.params
    const userId = req.user.id

    // Verify user is teacher of the meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { class: true },
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    if (meeting.teacherId !== userId) {
      return res.status(403).json({ error: 'Only teacher can start recording' })
    }

    // Start recording (just mark in database)
    const updated = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        recordingStartedAt: new Date(),
      },
    })

    res.status(200).json({
      message: 'Recording started',
      recordingStartedAt: updated.recordingStartedAt,
    })
  } catch (error) {
    console.error('[RecordingController] Error starting recording:', error)
    res.status(500).json({ error: 'Failed to start recording' })
  }
}

/**
 * Stop recording a video call
 * POST /api/meetings/:id/recording/stop
 */
export async function stopRecording(req, res) {
  try {
    const { id: meetingId } = req.params
    const userId = req.user.id
    const { recordingUrl } = req.body

    // Verify user is teacher of the meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    if (meeting.teacherId !== userId) {
      return res.status(403).json({ error: 'Only teacher can stop recording' })
    }

    const duration = meeting.recordingStartedAt
      ? Math.floor((new Date() - meeting.recordingStartedAt) / 1000)
      : 0

    const updated = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        recordingStoppedAt: new Date(),
        recordingUrl: recordingUrl || null,
        recordingDuration: duration,
      },
    })

    res.status(200).json({
      message: 'Recording stopped',
      recordingUrl: updated.recordingUrl,
      recordingDuration: updated.recordingDuration,
    })
  } catch (error) {
    console.error('[RecordingController] Error stopping recording:', error)
    res.status(500).json({ error: 'Failed to stop recording' })
  }
}

/**
 * Get recording status
 * GET /api/meetings/:id/recording/status
 */
export async function getRecordingStatus(req, res) {
  try {
    const { id: meetingId } = req.params

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        recordingStartedAt: true,
        recordingStoppedAt: true,
        recordingUrl: true,
        recordingDuration: true,
        hasTranscription: true,
        transcriptionUrl: true,
      },
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    const isRecording = meeting.recordingStartedAt && !meeting.recordingStoppedAt

    res.status(200).json({
      isRecording,
      recordingStartedAt: meeting.recordingStartedAt,
      recordingStoppedAt: meeting.recordingStoppedAt,
      recordingUrl: meeting.recordingUrl,
      recordingDuration: meeting.recordingDuration,
      hasTranscription: meeting.hasTranscription,
      transcriptionUrl: meeting.transcriptionUrl,
    })
  } catch (error) {
    console.error('[RecordingController] Error getting recording status:', error)
    res.status(500).json({ error: 'Failed to get recording status' })
  }
}

/**
 * Get meeting participants for video call
 * GET /api/meetings/:id/video/participants
 */
export async function getVideoParticipants(req, res) {
  try {
    const { id: meetingId } = req.params

    // Get current video session if active
    const activeSessions = await prisma.videoSession.findMany({
      where: {
        meetingId,
        status: 'active',
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 1,
    })

    if (activeSessions.length === 0) {
      return res.status(200).json({ participants: [] })
    }

    const participants = activeSessions[0].participants.map(p => ({
      userId: p.userId,
      username: p.user.username,
      joinedAt: p.joinedAt,
      videoEnabled: p.videoEnabled,
      audioEnabled: p.audioEnabled,
      screenShared: p.screenShared,
    }))

    res.status(200).json({ participants })
  } catch (error) {
    console.error('[VideoController] Error getting participants:', error)
    res.status(500).json({ error: 'Failed to get participants' })
  }
}

/**
 * Log call statistics
 * POST /api/meetings/:id/stats/log
 */
export async function logStats(req, res) {
  try {
    const { id: meetingId } = req.params
    const { sessionId, stats } = req.body

    if (!sessionId || !stats) {
      return res.status(400).json({ error: 'Missing sessionId or stats' })
    }

    await videoService.logCallStats(sessionId, meetingId, stats)

    res.status(201).json({ message: 'Stats logged' })
  } catch (error) {
    console.error('[VideoController] Error logging stats:', error)
    res.status(500).json({ error: 'Failed to log stats' })
  }
}

/**
 * Get call quality stats
 * GET /api/meetings/:id/stats/quality
 */
export async function getQualityStats(req, res) {
  try {
    const { id: meetingId } = req.params

    // Get latest stats from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const stats = await prisma.callStats.findMany({
      where: {
        meeting: { id: meetingId },
        recordedAt: { gte: fiveMinutesAgo },
      },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    })

    if (stats.length === 0) {
      return res.status(200).json({
        avgVideoBitrate: 0,
        avgLatency: 0,
        avgJitter: 0,
        avgPacketLoss: 0,
      })
    }

    const avgVideoBitrate = Math.round(
      stats.reduce((sum, s) => sum + (s.videoBitrate || 0), 0) / stats.length
    )
    const avgLatency = Math.round(
      stats.reduce((sum, s) => sum + (s.latencyMs || 0), 0) / stats.length
    )
    const avgJitter = Math.round(
      stats.reduce((sum, s) => sum + (s.jitterMs || 0), 0) / stats.length
    )
    const avgPacketLoss = parseFloat(
      (stats.reduce((sum, s) => sum + (s.packetLossPercent || 0), 0) / stats.length).toFixed(2)
    )

    res.status(200).json({
      avgVideoBitrate,
      avgLatency,
      avgJitter,
      avgPacketLoss,
      sampleSize: stats.length,
    })
  } catch (error) {
    console.error('[VideoController] Error getting quality stats:', error)
    res.status(500).json({ error: 'Failed to get quality stats' })
  }
}

/**
 * Send chat message in meeting
 * POST /api/meetings/:id/chat/message
 */
export async function sendChatMessage(req, res) {
  try {
    const { id: meetingId } = req.params
    const { content } = req.body
    const userId = req.user.id

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' })
    }

    const message = await videoService.saveChatMessage(
      meetingId,
      userId,
      content.trim(),
      req.user.username
    )

    res.status(201).json({
      id: message.id,
      userId: message.senderId,
      username: message.senderName,
      content: message.content,
      timestamp: message.createdAt,
    })
  } catch (error) {
    console.error('[ChatController] Error sending message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

/**
 * Get chat history for a meeting
 * GET /api/meetings/:id/chat/history
 */
export async function getChatHistory(req, res) {
  try {
    const { id: meetingId } = req.params
    const { limit = 50 } = req.query

    const messages = await videoService.getChatHistory(meetingId, parseInt(limit))

    res.status(200).json({
      messages: messages.map(m => ({
        id: m.id,
        userId: m.senderId,
        username: m.senderName,
        content: m.content,
        timestamp: m.createdAt,
      })),
    })
  } catch (error) {
    console.error('[ChatController] Error getting chat history:', error)
    res.status(500).json({ error: 'Failed to get chat history' })
  }
}

