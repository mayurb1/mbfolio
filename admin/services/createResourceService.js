import api from '../../services/api'

// Shared request wrapper: unwraps the axios response and normalizes errors to a
// thrown Error whose message prefers the server-provided message, then the
// axios message, then the supplied fallback. Centralizes the try/catch that
// every service method used to repeat.
export async function request(fn, fallback) {
  try {
    const response = await fn()
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || fallback)
  }
}

/**
 * Build the standard CRUD method set for a REST resource. Returns generic
 * method names; each entity service re-exports these under its own
 * entity-specific names so existing call sites keep working unchanged.
 *
 * @param {string} basePath e.g. '/categories'
 * @param {{ singular: string, plural: string }} labels used in fallback messages
 */
export function createResourceService(basePath, { singular, plural }) {
  return {
    getAll: (params = {}) =>
      request(() => api.get(basePath, { params }), `Failed to fetch ${plural}`),
    getById: (id) =>
      request(() => api.get(`${basePath}/${id}`), `Failed to fetch ${singular}`),
    create: (data) =>
      request(() => api.post(basePath, data), `Failed to create ${singular}`),
    update: (id, data) =>
      request(() => api.put(`${basePath}/${id}`, data), `Failed to update ${singular}`),
    partialUpdate: (id, data) =>
      request(() => api.patch(`${basePath}/${id}`, data), `Failed to update ${singular}`),
    remove: (id) =>
      request(() => api.delete(`${basePath}/${id}`), `Failed to delete ${singular}`),
    toggleStatus: (id) =>
      request(
        () => api.patch(`${basePath}/${id}/toggle-status`),
        `Failed to toggle ${singular} status`
      ),
  }
}
