// All endpoints return 501 until DB layer is connected.


/**
 * Register Services request ticket
 * @route POST /services
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const requestService = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /services' });
};
