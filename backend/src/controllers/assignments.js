// All endpoints return 501 until DB layer is connected.


/**
 * List assignments
 * @route GET /
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const listAssignments = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /' });
};


/**
 * Create new assignment (teacher)
 * @route POST /
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const createAssignment = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /' });
};


/**
 * Submit assignment (file/link)
 * @route POST /:id/submit
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const submitAssignment = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /:id/submit' });
};
