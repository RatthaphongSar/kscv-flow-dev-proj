// All endpoints return 501 until DB layer is connected.


/**
 * Admin creates account
 * @route POST /
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const createUser = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /' });
};


/**
 * Get current user profile
 * @route GET /me
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const getMe = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /me' });
};


/**
 * Update own profile
 * @route PATCH /me
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const updateMe = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'PATCH /me' });
};
