/**
 * @file chat.test.js
 * @description Unit tests for chat controller
 * @module tests/unit/controllers/chat
 */

describe('Chat Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      user: { id: 'user-123', role: 'TEACHER' },
      files: []
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('List Rooms', () => {
    test('should list all chat rooms for user', async () => {
      // Expected: Array of rooms
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              description: expect.any(String),
              pinned: expect.any(Boolean),
              memberCount: expect.any(Number),
              lastMessage: expect.any(String)
            })
          ])
        })
      );
    });

    test('should sort pinned rooms first', async () => {
      // Expected: Pinned rooms before unpinned
      const data = mockRes.json.mock.calls[0][0].data;
      const pinnedIndex = data.findIndex(r => r.pinned);
      const unpinnedIndex = data.findIndex(r => !r.pinned);
      
      if (pinnedIndex !== -1 && unpinnedIndex !== -1) {
        expect(pinnedIndex).toBeLessThan(unpinnedIndex);
      }
    });

    test('should require authentication', async () => {
      mockReq.user = null;

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Create Room', () => {
    test('should create room (teacher/admin only)', async () => {
      mockReq.body = {
        name: 'Advanced Programming',
        description: 'Class discussion',
        memberIds: ['user-1', 'user-2']
      };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Room created
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Advanced Programming',
            code: expect.any(String)
          })
        })
      );
    });

    test('should reject room creation for students', async () => {
      mockReq.body = { name: 'Test Room' };
      mockReq.user = { role: 'STUDENT' };

      // Expected: 403 Forbidden
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    test('should validate room name', async () => {
      mockReq.body = { description: 'No name provided' };
      mockReq.user = { role: 'TEACHER' };

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('name')
        })
      );
    });

    test('should generate unique room code', async () => {
      mockReq.body = { name: 'Test Room' };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Unique room code
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: expect.stringMatching(/^[A-Z0-9]{6,8}$/)
          })
        })
      );
    });
  });

  describe('List Messages', () => {
    test('should list messages in room (paginated)', async () => {
      mockReq.params = { roomId: 'room-123' };
      mockReq.query = { page: 1, limit: 20 };

      // Expected: Paginated messages
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              content: expect.any(String),
              sender: expect.any(Object),
              timestamp: expect.any(String),
              files: expect.any(Array)
            })
          ]),
          pagination: expect.objectContaining({
            page: 1,
            limit: 20
          })
        })
      );
    });

    test('should sort messages chronologically (newest first)', async () => {
      mockReq.params = { roomId: 'room-123' };

      // Expected: Newest messages first
      const messages = mockRes.json.mock.calls[0][0].data;
      if (messages.length > 1) {
        const timestamp1 = new Date(messages[0].timestamp).getTime();
        const timestamp2 = new Date(messages[1].timestamp).getTime();
        expect(timestamp1).toBeGreaterThanOrEqual(timestamp2);
      }
    });

    test('should only show messages for room members', async () => {
      mockReq.params = { roomId: 'room-123' };
      mockReq.user = { id: 'nonmember' };

      // Expected: 403 Forbidden
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Send Message', () => {
    test('should send text message', async () => {
      mockReq.params = { roomId: 'room-123' };
      mockReq.body = { content: 'Hello everyone!' };
      mockReq.user = { id: 'user-123' };

      // Expected: Message saved and broadcast
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: expect.any(String),
            content: 'Hello everyone!',
            sender: expect.objectContaining({
              id: 'user-123'
            })
          })
        })
      );
    });

    test('should send message with file attachments', async () => {
      mockReq.params = { roomId: 'room-123' };
      mockReq.body = { content: 'Check this file' };
      mockReq.files = [
        { filename: 'document.pdf', size: 1000000 }
      ];

      // Expected: Message with files
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            files: expect.arrayContaining([
              expect.objectContaining({
                filename: 'document.pdf'
              })
            ])
          })
        })
      );
    });

    test('should reject message exceeding file size limit', async () => {
      mockReq.files = [
        { filename: 'huge.file', size: 60000000 } // 60MB
      ];

      // Expected: 400 File too large
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('size')
        })
      );
    });

    test('should require either content or files', async () => {
      mockReq.params = { roomId: 'room-123' };
      mockReq.body = { content: '' };
      mockReq.files = [];

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('content')
        })
      );
    });
  });

  describe('Delete Message', () => {
    test('should delete own message', async () => {
      mockReq.params = {
        roomId: 'room-123',
        messageId: 'msg-123'
      };
      mockReq.user = { id: 'msg-sender' };

      // Expected: Message deleted
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should not allow deleting others messages', async () => {
      mockReq.params = {
        roomId: 'room-123',
        messageId: 'msg-123'
      };
      mockReq.user = { id: 'other-user' };

      // Expected: 403 Forbidden
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Pin/Unpin Room', () => {
    test('should pin room', async () => {
      mockReq.params = { roomId: 'room-123' };
      mockReq.user = { id: 'user-123' };

      // Expected: Room pinned
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pinned: true
          })
        })
      );
    });

    test('should unpin room', async () => {
      mockReq.params = { roomId: 'room-123' };
      mockReq.user = { id: 'user-123' };

      // Expected: Room unpinned
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pinned: false
          })
        })
      );
    });
  });

  describe('Get Pinned Rooms', () => {
    test('should return only pinned rooms', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: Only pinned rooms
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              pinned: true
            })
          ])
        })
      );
    });
  });
});
