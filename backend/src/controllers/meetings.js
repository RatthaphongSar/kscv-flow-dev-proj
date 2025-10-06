// All endpoints return 501 until DB layer is connected.


/**
 * List meetings user can join
 * @route GET /
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const listMeetings = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /' });
};
