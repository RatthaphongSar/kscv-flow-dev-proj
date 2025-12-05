import { api } from '../utils/api.js'

export const announcementApi = {
  /**
   * Get announcements with optional filters
   */
  async getAnnouncements(classId?: string, skip?: number, take?: number) {
    const params = new URLSearchParams()
    if (classId) params.append('classId', classId)
    if (skip !== undefined) params.append('skip', String(skip))
    if (take !== undefined) params.append('take', String(take))

    const response: any = await api(`/announcements?${params.toString()}`, { method: 'GET' })
    return response?.data
  },

  /**
   * Create announcement (teacher/admin only)
   */
  async createAnnouncement(data: {
    title: string
    content: string
    excerpt?: string
    category?: string
    image?: string
    classId: string
  }) {
    const response: any = await api('/announcements', { method: 'POST', body: data })
    return response?.data
  },

  /**
   * Update announcement (author/admin only)
   */
  async updateAnnouncement(
    id: string,
    data: {
      title?: string
      content?: string
      excerpt?: string
      category?: string
      image?: string
    }
  ) {
    const response: any = await api(`/announcements/${id}`, { method: 'PATCH', body: data })
    return response?.data
  },

  /**
   * Delete announcement (author/admin only)
   */
  async deleteAnnouncement(id: string) {
    const response: any = await api(`/announcements/${id}`, { method: 'DELETE' })
    return response?.data
  },
}
