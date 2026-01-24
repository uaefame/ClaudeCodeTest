// API base URL - in production, points to Railway backend
// In development, uses local proxy (empty string = relative URL)
export const API_URL = import.meta.env.VITE_API_URL || '';
