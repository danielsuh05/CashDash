import { apiCall } from '../utils/api.js'

/**
 * Ensure the authenticated user has a profile row. If it doesn't exist, create with defaults.
 */
export async function ensureUserProfile(username) {
  return apiCall('/profiles/ensure', {
    method: 'POST',
    body: JSON.stringify({ username })
  })
}
