// All endpoints return 501 until DB layer is connected.


/**
 * Get Grades & Transcript for student
 * @route GET /transcript
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const getTranscript = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'GET /transcript' });
};
