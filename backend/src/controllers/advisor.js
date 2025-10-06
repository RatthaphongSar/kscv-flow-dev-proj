// All endpoints return 501 until DB layer is connected.


/**
 * Advisor contact info
 * @route GET /contact
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const advisorContact = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /contact' });
};
