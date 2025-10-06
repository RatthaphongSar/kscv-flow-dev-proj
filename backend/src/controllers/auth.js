// All endpoints return 501 until DB layer is connected.


/**
 * Login with username/password (JWT issuance)
 * @route POST /login
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const login = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /login' });
};


/**
 * Invalidate token (client-side + server revocation optional)
 * @route POST /logout
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const logout = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /logout' });
};
