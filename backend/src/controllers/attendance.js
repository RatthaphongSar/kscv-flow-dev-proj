// All endpoints return 501 until DB layer is connected.


/**
 * Check-in (checkline) for attendance
 * @route POST /checkin
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const checkIn = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /checkin' });
};


/**
 * My attendance records
 * @route GET /my
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const myAttendance = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /my' });
};
