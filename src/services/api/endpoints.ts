export const API_ENDPOINTS = {
  health: '/health',
  materials: '/api/v1/materials',
  materialsRecommend: '/api/v1/materials/recommend',
  calculateCBS: '/api/v1/calculate/material-cbs',
  calculateIGO: '/api/v1/calculate/igo',
  location: '/api/v1/location',
  suppliersSearch: '/api/v1/suppliers/search',
  projects: '/api/v1/projects',
  projectDetail: (id: string) => `/api/v1/projects/${id}`,
} as const;
