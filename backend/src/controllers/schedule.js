// All endpoints return 501 until DB layer is connected.


/**
 * Get weekly/daily schedule
 * @route GET /
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const getSchedule = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /' });
};
