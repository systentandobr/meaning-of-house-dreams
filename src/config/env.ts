export const ENV_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8889',
} as const;
