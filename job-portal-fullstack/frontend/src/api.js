const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  let response;

  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach the API at ${BASE}. Start the backend and check that MongoDB is running.`);
    }
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
