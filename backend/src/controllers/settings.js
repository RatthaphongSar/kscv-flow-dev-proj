// All endpoints return 501 until DB layer is connected.


/**
 * Update user preferences (i18n, dark mode, notifications)
 * @route PATCH /preferences
 * @returns {{}} 501 Not Implemented
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const updatePreferences = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'PATCH /preferences' });
};
