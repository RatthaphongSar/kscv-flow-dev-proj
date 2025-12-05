/**
 * @file export.test.js
 * @description Unit tests for export controller (PDF, CSV)
 * @module tests/unit/controllers/export
 */

describe('Export Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      user: { id: 'user-123', role: 'STUDENT' },
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis()
    };
  });

  describe('Export Transcript PDF', () => {
    test('should export transcript as PDF', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: PDF file returned
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('transcript')
      );
      expect(mockRes.send).toHaveBeenCalledWith(expect.any(Buffer));
    });

    test('should include correct data in PDF', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected data in PDF:
      // - Student name, ID, academic year
      // - List of courses with grades
      // - GPA calculation
      // - Generated date

      expect(mockRes.send).toHaveBeenCalled();
      const pdfBuffer = mockRes.send.mock.calls[0][0];
      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    test('should require authentication', async () => {
      mockReq.user = null;

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('should handle no grades scenario', async () => {
      mockReq.user = { id: 'new-student' };

      // Expected: PDF with empty grades section or message
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('Export Activities CSV', () => {
    test('should export activities as CSV', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: CSV file
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('activities')
      );
      expect(mockRes.send).toHaveBeenCalledWith(expect.any(String));
    });

    test('should include CSV headers', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected CSV headers:
      // Date, Activity Name, Club, Type, Hours, Status

      expect(mockRes.send).toHaveBeenCalled();
      const csvData = mockRes.send.mock.calls[0][0];
      expect(csvData).toContain('Date');
      expect(csvData).toContain('Activity');
      expect(csvData).toContain('Club');
    });

    test('should format data properly in CSV', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: Proper CSV formatting
      // - Headers row
      // - Data rows with correct columns
      // - Escaped quotes and commas

      expect(mockRes.send).toHaveBeenCalled();
      const csvData = mockRes.send.mock.calls[0][0];
      const rows = csvData.split('\n');
      expect(rows.length).toBeGreaterThan(1);
    });

    test('should handle empty activities', async () => {
      mockReq.user = { id: 'inactive-student' };

      // Expected: CSV with headers only
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalled();
      const csvData = mockRes.send.mock.calls[0][0];
      expect(csvData).toContain('Activity');
    });

    test('should require authentication', async () => {
      mockReq.user = null;

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Export Attendance CSV', () => {
    test('should export attendance as CSV', async () => {
      mockReq.user = { id: 'user-123' };
      mockReq.query = { month: '2025-12' };

      // Expected: CSV file with attendance
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attendance')
      );
    });

    test('should include attendance headers', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected headers:
      // Date, Class, Status, Time, Remark

      expect(mockRes.send).toHaveBeenCalled();
      const csvData = mockRes.send.mock.calls[0][0];
      expect(csvData).toContain('Date');
      expect(csvData).toContain('Status');
    });

    test('should filter by month', async () => {
      mockReq.user = { id: 'user-123' };
      mockReq.query = { month: '2025-12' };

      // Expected: Only December attendance
      expect(mockRes.send).toHaveBeenCalled();
      const csvData = mockRes.send.mock.calls[0][0];
      const rows = csvData.split('\n').filter(r => r.length > 0);
      
      // All data rows should be December
      rows.forEach(row => {
        if (!row.includes('Date')) { // Skip header
          expect(row).toMatch(/2025-12/);
        }
      });
    });

    test('should calculate statistics in CSV', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: Statistics rows
      // Total, Present, Absent, Late, Rate

      expect(mockRes.send).toHaveBeenCalled();
      const csvData = mockRes.send.mock.calls[0][0];
      const hasStats = csvData.includes('Total') || csvData.includes('Attendance Rate');
      expect(hasStats).toBe(true);
    });
  });

  describe('File Generation Errors', () => {
    test('should handle file generation errors gracefully', async () => {
      mockReq.user = { id: 'user-123' };
      
      // Simulate error during PDF generation
      // Expected: 500 with error message
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('export')
        })
      );
    });

    test('should provide meaningful error messages', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: Descriptive error
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          message: expect.any(String)
        })
      );
    });
  });

  describe('Filename Generation', () => {
    test('should generate proper PDF filename', async () => {
      mockReq.user = { id: 'user-123', username: 'john-doe' };

      // Expected: transcript_john-doe_YYYY-MM-DD.pdf
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringMatching(/^attachment;.*filename=.*\.pdf$/)
      );
    });

    test('should generate proper CSV filename', async () => {
      mockReq.user = { id: 'user-123', username: 'jane-smith' };

      // Expected: activities_jane-smith_YYYY-MM-DD.csv or similar
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringMatching(/^attachment;.*filename=.*\.csv$/)
      );
    });
  });
});
