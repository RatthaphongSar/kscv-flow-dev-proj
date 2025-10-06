// All endpoints return 501 until DB layer is connected.


/**
 * Clubs & Activities list
 * @route GET /
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const listClubs = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /' });
};


/**
 * Enroll to a club
 * @route POST /enroll
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const enrollClub = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /enroll' });
};
