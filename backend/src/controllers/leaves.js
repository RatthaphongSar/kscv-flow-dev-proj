// All endpoints return 501 until DB layer is connected.


/**
 * Submit leave request (sick/personal/ordination/other) with rules
 * @route POST /
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const requestLeave = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /' });
};


/**
 * List my leave requests
 * @route GET /my
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const myLeaves = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /my' });
};


/**
 * Attach doctor certificate when sick leave > 2 days
 * @route POST /:id/attach-doctor-cert
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const attachDoctorCert = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /:id/attach-doctor-cert' });
};


/**
 * Advisor/Admin approve/reject
 * @route PATCH /:id/status
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const approveOrReject = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'PATCH /:id/status' });
};
